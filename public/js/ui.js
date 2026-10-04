const CATEGORIES = [
  { title: 'Kids', icon: '🧸', giverType: 'old guard', receiverType: 'kid' },
  { title: 'Young Adults', icon: '🎓', giverType: 'young adult', receiverType: 'young adult' },
  { title: 'Old Guard', icon: '🍷', giverType: 'old guard', receiverType: 'old guard' },
];

const FAMILY_MEMBER_TYPES = [
  { value: 'kid', label: 'Kid', badgeClass: 'badge--kid' },
  { value: 'young adult', label: 'Young Adult', badgeClass: 'badge--young-adult' },
  { value: 'old guard', label: 'Old Guard', badgeClass: 'badge--old-guard' },
];
const TOP_LEVEL_PERSON_TYPE = 'old guard';
const CHILD_PERSON_TYPE = 'kid';
const ROOT_PARENT_ID = 'root';

const NEWCOMER_LABEL = 'Newcomer!';
const YEAR_OFF_LABEL = 'Year off! 🎉';
const COPIED_LABEL = '✅ Copied!';
// Lets the browser paint the "drawing" state before the synchronous matching algorithm blocks it.
const PAINT_DELAY_MS = 50;

const currentYear = new Date().getFullYear();
const lastYear = currentYear - 1;

let compiledTree;
let lastYearExchanges = new Map();
let thisYearExchanges = new Map();

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

function isReadOnly() {
  return document.querySelector('#tree').getAttribute('data-disabled') === 'true';
}

function categoryKey(giverType, receiverType) {
  return `${giverType}:${receiverType}`;
}

function exchangesFor(exchangesByCategory, category) {
  return exchangesByCategory.get(categoryKey(category.giverType, category.receiverType)) || [];
}

function groupExchangesByCategory(exchangeData, xmasYear) {
  const grouped = new Map(CATEGORIES.map((category) => [categoryKey(category.giverType, category.receiverType), []]));
  exchangeData.forEach((exchange) => {
    if (String(exchange.xmas_year) !== String(xmasYear)) {
      return;
    }
    const group = grouped.get(categoryKey(exchange.giver_type, exchange.receiver_type));
    if (group) {
      group.push({
        giver: exchange.giver_name,
        receiver: exchange.receiver_name,
        socialDistance: exchange.social_distance,
      });
    }
  });
  return grouped;
}

/* ---------- Results ---------- */

function lastYearReceiverFor(exchange, category) {
  if (exchange.exchangeFromLastYear?.receiver) {
    return exchange.exchangeFromLastYear.receiver;
  }
  const lastYearExchange = algo.getExchangeDataForGiver(exchange.giver, category.receiverType, exchangesFor(lastYearExchanges, category));
  return lastYearExchange?.receiver || NEWCOMER_LABEL;
}

function renderTag(exchange, category) {
  const isYearOff = exchange.receiver === algo.NO_RECIPIENT;
  const hasDistance = exchange.socialDistance !== null && exchange.socialDistance !== undefined && Number(exchange.socialDistance) >= 0;
  const lastYearReceiver = lastYearReceiverFor(exchange, category);
  return `
    <article class="tag${isYearOff ? ' tag--year-off' : ''}"
      data-giver="${escapeHtml(exchange.giver.toLowerCase())}"
      data-receiver="${escapeHtml(exchange.receiver.toLowerCase())}">
      <strong class="tag__giver">${escapeHtml(exchange.giver)}</strong>
      <span class="tag__arrow">gives to</span>
      <strong class="tag__receiver">${escapeHtml(isYearOff ? YEAR_OFF_LABEL : exchange.receiver)}</strong>
      <div class="tag__meta">
        <span>Last year: ${escapeHtml(lastYearReceiver === algo.NO_RECIPIENT ? 'nobody' : lastYearReceiver)}</span>
        ${hasDistance ? `<span title="Genetic distance">🧬 ${escapeHtml(exchange.socialDistance)}</span>` : ''}
      </div>
    </article>
  `;
}

function renderResultsGroup(category, exchanges, stats) {
  const statsHTML = stats ? `<p class="results-group__stats">Best of ${stats.iterations} draws · ${stats.executionTime} ms</p>` : '';
  const tagsHTML = exchanges.length
    ? `<div class="tags">${exchanges.map((exchange) => renderTag(exchange, category)).join('')}</div>`
    : '<p class="empty-state">No matches in this group.</p>';
  return `
    <section class="results-group">
      <header class="results-group__header">
        <h3 class="results-group__title"><span aria-hidden="true">${category.icon}</span> ${category.title}</h3>
        ${statsHTML}
      </header>
      ${tagsHTML}
    </section>
  `;
}

function renderEmptyResults() {
  const message = isReadOnly()
    ? "The elves haven't drawn names yet. Check back soon!"
    : 'Get the family tree in shape, then hit “Draw names”.';
  document.querySelector('#results').innerHTML = `
    <div class="empty-state"><span class="empty-state__icon" aria-hidden="true">🧝</span>${message}</div>
  `;
}

function showResults() {
  const hasSavedResults = CATEGORIES.some((category) => exchangesFor(thisYearExchanges, category).length);
  if (!hasSavedResults) {
    renderEmptyResults();
    return;
  }
  document.querySelector('#results').innerHTML = CATEGORIES
    .map((category) => renderResultsGroup(category, exchangesFor(thisYearExchanges, category)))
    .join('');
  applyResultsFilter();
}

function toSavedExchange(exchange, category) {
  return {
    xmas_year: currentYear,
    giver_type: category.giverType,
    receiver_type: category.receiverType,
    giver_name: exchange.giver,
    receiver_name: exchange.receiver,
    giver_id: exchange.giver_id,
    receiver_id: exchange.receiver_id,
    social_distance: exchange.socialDistance,
  };
}

function addSaveBar(draws) {
  const resultsContainer = document.querySelector('#results');
  resultsContainer.insertAdjacentHTML('beforeend', `
    <div class="save-bar">
      <button class="button button--gold" type="button" data-save-exchanges>💾 Save this draw</button>
      <p class="save-bar__status" role="status" data-save-status></p>
    </div>
  `);
  const saveButton = resultsContainer.querySelector('[data-save-exchanges]');
  const statusEl = resultsContainer.querySelector('[data-save-status]');
  saveButton.addEventListener('click', async () => {
    const allExchanges = draws.flatMap(({ category, result }) => result.map((exchange) => toSavedExchange(exchange, category)));
    saveButton.disabled = true;
    statusEl.classList.remove('save-bar__status--error');
    try {
      await api.saveGiftExchanges(allExchanges, currentYear);
      statusEl.textContent = 'Saved! The family can now find their matches. 🎉';
    } catch (error) {
      statusEl.classList.add('save-bar__status--error');
      statusEl.textContent = `Couldn't save: ${error instanceof Error ? error.message : error}`;
    } finally {
      saveButton.disabled = false;
    }
  });
}

async function displayNewSetOfResults() {
  const generateButton = document.querySelector('#generate-results');
  const resultsContainer = document.querySelector('#results');
  generateButton.disabled = true;
  resultsContainer.innerHTML = '<div class="loading">The elves are drawing names…</div>';
  await new Promise((resolve) => setTimeout(resolve, PAINT_DELAY_MS));

  const draws = CATEGORIES.map((category) => ({
    category,
    ...algo.run(compiledTree, category.giverType, category.receiverType, exchangesFor(lastYearExchanges, category)),
  }));
  resultsContainer.innerHTML = draws
    .map(({ category, result, iterations, executionTime }) => renderResultsGroup(category, result, { iterations, executionTime }))
    .join('');
  addSaveBar(draws);
  applyResultsFilter();
  generateButton.disabled = false;
}

function applyResultsFilter() {
  const query = document.querySelector('#filter-results').value.trim().toLowerCase();
  document.querySelectorAll('#results .tag').forEach((tag) => {
    tag.hidden = Boolean(query) && !tag.dataset.giver.includes(query) && !tag.dataset.receiver.includes(query);
  });
}

/* ---------- Family tree ---------- */

function familyMemberTypeFor(value) {
  return FAMILY_MEMBER_TYPES.find((type) => type.value === value);
}

function renderPersonSummary(node) {
  const type = familyMemberTypeFor(node.type);
  return `
    <div class="person__summary">
      <span class="person__name">${escapeHtml(node.name || 'Unnamed elf')}</span>
      ${node.partner ? `<span class="person__partner">&amp; ${escapeHtml(node.partner)}</span>` : ''}
      ${type ? `<span class="badge ${type.badgeClass}">${type.label}</span>` : ''}
      ${node.participating ? '' : '<span class="badge badge--sitting-out">Sitting this one out</span>'}
    </div>
  `;
}

function renderPersonEditor(node) {
  const id = escapeHtml(node.ID);
  const placeholderOption = familyMemberTypeFor(node.type) ? '' : '<option value="" selected disabled>Choose…</option>';
  const typeOptions = FAMILY_MEMBER_TYPES
    .map((type) => `<option value="${type.value}"${node.type === type.value ? ' selected' : ''}>${type.label}</option>`)
    .join('');
  return `
    <div class="person__fields">
      <div>
        <label for="${id}-name">Name</label>
        <input id="${id}-name" type="text" data-field="name" value="${escapeHtml(node.name)}" />
      </div>
      <div>
        <label for="${id}-partner">Partner</label>
        <input id="${id}-partner" type="text" data-field="partner" value="${escapeHtml(node.partner)}" />
      </div>
      <div>
        <label for="${id}-type">Type</label>
        <select id="${id}-type" data-field="type">${placeholderOption}${typeOptions}</select>
      </div>
      <label class="checkbox" for="${id}-participating">
        <input id="${id}-participating" type="checkbox" data-field="participating"${node.participating ? ' checked' : ''} />
        Participating this year
      </label>
    </div>
    <div class="person__actions">
      <button class="button button--quiet" type="button" data-action="add">➕ Add child</button>
      <button class="button button--quiet button--danger" type="button" data-action="remove">🗑️ Remove</button>
    </div>
  `;
}

function bindPersonEditor(personEl, node) {
  const cardEl = personEl.querySelector('.person__card');
  cardEl.querySelector('[data-action="add"]').addEventListener('click', () => addPerson(node.ID));
  cardEl.querySelector('[data-action="remove"]').addEventListener('click', () => removePerson(node.ID));
  cardEl.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('change', () => {
      node[input.dataset.field] = input.type === 'checkbox' ? input.checked : input.value;
      personEl.classList.toggle('person--sitting-out', !node.participating);
      api.updatePersonOnServer(node);
    });
  });
}

function renderPerson(node) {
  const personEl = document.createElement('div');
  personEl.className = node.participating ? 'person' : 'person person--sitting-out';
  personEl.id = `person-${node.ID}-wrapper`;
  personEl.innerHTML = `
    <div class="person__card">${isReadOnly() ? renderPersonSummary(node) : renderPersonEditor(node)}</div>
    <div class="person__children"></div>
  `;
  if (!isReadOnly()) {
    bindPersonEditor(personEl, node);
  }
  const childrenEl = personEl.querySelector('.person__children');
  (node.children || []).forEach((child) => childrenEl.appendChild(renderPerson(child)));
  return personEl;
}

function renderTree() {
  const containerEl = document.querySelector('#tree');
  containerEl.innerHTML = '';
  if (!compiledTree.children.length) {
    containerEl.innerHTML = '<div class="empty-state"><span class="empty-state__icon" aria-hidden="true">🌱</span>No family yet — add the first branch!</div>';
    return;
  }
  compiledTree.children.forEach((child) => containerEl.appendChild(renderPerson(child)));
}

async function addPerson(parentID) {
  const newNodeData = {
    name: '',
    partner: '',
    type: parentID === ROOT_PARENT_ID ? TOP_LEVEL_PERSON_TYPE : CHILD_PERSON_TYPE,
    children: [],
    parent: parentID,
    participating: true,
  };
  const newPersonData = await api.addPerson(newNodeData);
  newNodeData.ID = newPersonData.id;
  algo.addChildToNode(compiledTree, parentID, newNodeData);
  renderTree();

  const newPersonEl = document.querySelector(`#person-${newPersonData.id}-wrapper`);
  newPersonEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  newPersonEl.querySelector('[data-field="name"]').focus({ preventScroll: true });
}

function removePerson(personID) {
  algo.removeNode(compiledTree, personID);
  api.removePerson(personID);
  renderTree();
}

/* ---------- Wiring ---------- */

function listenForControls() {
  document.querySelector('#filter-results').addEventListener('input', applyResultsFilter);
  document.querySelector('#generate-results')?.addEventListener('click', displayNewSetOfResults);
  document.querySelector('#add-top-level-person')?.addEventListener('click', () => addPerson(ROOT_PARENT_ID));

  const copyButton = document.querySelector('[data-copy-share-url]');
  copyButton?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(document.querySelector('[data-share-url]').textContent.trim());
    copyButton.textContent = COPIED_LABEL;
  });
}

async function displayEverything() {
  const [tree, exchangeData] = await Promise.all([api.fetchFamilyMemberData(), api.fetchGiftExchangeData()]);
  compiledTree = tree;
  lastYearExchanges = groupExchangesByCategory(exchangeData, lastYear);
  thisYearExchanges = groupExchangesByCategory(exchangeData, currentYear);
  renderTree();
  showResults();
  listenForControls();
}

displayEverything();
