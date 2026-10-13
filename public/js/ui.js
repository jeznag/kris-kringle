const CATEGORIES = [
  { title: 'Kids', icon: '🧸', giverType: 'old guard', receiverType: 'kid' },
  { title: 'Young Adults', icon: '🎓', giverType: 'young adult', receiverType: 'young adult' },
  { title: 'Old Guard', icon: '🎅', giverType: 'old guard', receiverType: 'old guard' },
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

// Failed writes are already reported to the user through the API error banner.
function ignoreReportedApiError() {}

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
  const lastYearExchange = algo.getExchangeDataForGiver(exchange.giver, exchangesFor(lastYearExchanges, category));
  return lastYearExchange?.receiver || NEWCOMER_LABEL;
}

function renderDistanceButton(exchange) {
  // Computed from the tree as it is now, so it always matches the diagram it opens.
  const connection = algo.getConnection(compiledTree, exchange.giver, exchange.receiver);
  if (!connection) {
    return '';
  }
  return `
    <button class="tag__distance" type="button" title="Six degrees of Kris Kringle: see how you're connected"
      data-connection-giver="${escapeHtml(exchange.giver)}" data-connection-receiver="${escapeHtml(exchange.receiver)}">
      🔗 ${degreesOfSeparation(connection.distance)}
    </button>
  `;
}

function renderTag(exchange, category) {
  const isYearOff = exchange.receiver === algo.NO_RECIPIENT;
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
        ${isYearOff ? '' : renderDistanceButton(exchange)}
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

/* ---------- How are we connected? ---------- */

const DIAGRAM = {
  COLUMN_WIDTH: 128,
  ROW_HEIGHT: 92,
  NODE_WIDTH: 116,
  NODE_HEIGHT: 52,
  NODE_RADIUS: 12,
  PADDING: 12,
  LINE_HEIGHT: 16,
  MAX_LINE_LENGTH: 15,
  MAX_LINES: 2,
  // Below this the names get too small to read on a phone, so the diagram scrolls instead.
  MIN_SCALE: 0.75,
};
const GENERATION_CHANGE = { parent: -1, child: 1, partner: 0 };
const PARTNER_RELATION = 'partner';
const SHARED_ANCESTORS_LABEL = 'Shared ancestors';
const RELATIONSHIP_QUIPS = {
  [algo.RELATIONSHIP_KINDS.PARTNER]: 'Partners in crime. (This should never happen.)',
  [algo.RELATIONSHIP_KINDS.PARENT]: 'Buying for the people who bought you everything.',
  [algo.RELATIONSHIP_KINDS.CHILD]: 'Parental spoiling rights: activated.',
  [algo.RELATIONSHIP_KINDS.SIBLING]: 'Sibling rivalry: gift edition.',
  [algo.RELATIONSHIP_KINDS.GRANDPARENT]: 'Hard to buy for since forever.',
  [algo.RELATIONSHIP_KINDS.GRANDCHILD]: 'Grandparent spoiling rights: activated.',
  [algo.RELATIONSHIP_KINDS.AUNT_OR_UNCLE]: "Time to prove you're the favourite niece or nephew.",
  [algo.RELATIONSHIP_KINDS.NIECE_OR_NEPHEW]: 'Fun aunty and uncle duties: activated.',
  [algo.RELATIONSHIP_KINDS.COUSIN]: 'Cousin territory: the Kris Kringle sweet spot.',
};
const IN_LAW_QUIP = 'In-law diplomacy at its finest.';
// From here on the path is long enough that Kevin Bacon gets the credit, whoever's involved.
const KEVIN_BACON_DISTANCE = 5;
// Indexed by degrees of separation; anything further uses the last one.
const KEVIN_BACON_QUIPS = [
  'Same person. Bold move.',
  'Practically joined at the hip.',
  'Basically the same Christmas table.',
  'Close enough to fight over the leftovers.',
  'Just the right amount of related.',
  'Kevin Bacon would need a minute to get here.',
  'Six degrees. Kevin Bacon would be proud.',
  'Further apart than Kevin Bacon and most of Hollywood.',
];

function degreesOfSeparation(distance) {
  return `${distance} ${distance === 1 ? 'degree' : 'degrees'} of separation`;
}

/** A quip that fits the relationship, falling back to Kevin Bacon for long or unnamed paths. */
function separationQuip(connection) {
  const { distance, relationshipKind, isInLaw } = connection;
  const kevinBaconQuip = KEVIN_BACON_QUIPS[Math.min(distance, KEVIN_BACON_QUIPS.length - 1)];
  if (!relationshipKind) {
    return kevinBaconQuip;
  }
  if (!isInLaw) {
    return RELATIONSHIP_QUIPS[relationshipKind];
  }
  return distance < KEVIN_BACON_DISTANCE ? IN_LAW_QUIP : kevinBaconQuip;
}
const LEFT = -1;
const RIGHT = 1;

function displayName(person) {
  return person === algo.FAMILY_ROOT ? SHARED_ANCESTORS_LABEL : algo.cleanName(person);
}

function wrapLabel(text) {
  const lines = [];
  text.split(' ').forEach((word) => {
    const lastLine = lines[lines.length - 1];
    if (lastLine && `${lastLine} ${word}`.length <= DIAGRAM.MAX_LINE_LENGTH) {
      lines[lines.length - 1] = `${lastLine} ${word}`;
    } else {
      lines.push(word);
    }
  });
  const visibleLines = lines.slice(0, DIAGRAM.MAX_LINES);
  if (lines.length > DIAGRAM.MAX_LINES) {
    visibleLines[DIAGRAM.MAX_LINES - 1] += '…';
  }
  return visibleLines;
}

/**
 * Lays the path out like a family tree: the highest ancestor on top, the giver's side going
 * down on the left and the receiver's on the right, one row per generation. Partners sit
 * beside the person they're with, so most paths need only three columns.
 */
function layoutConnection(steps) {
  let generation = 0;
  const nodes = steps.map((step) => {
    generation += step.relation ? GENERATION_CHANGE[step.relation] : 0;
    return { ...step, generation, column: 0 };
  });
  const topGeneration = Math.min(...nodes.map((node) => node.generation));
  const apexIndex = nodes.findIndex((node) => node.generation === topGeneration);

  const placeBranch = (indexes, direction, linkRelation) => {
    let column = 0;
    indexes.forEach((index, offset) => {
      const isFirstOffApex = offset === 0;
      column += isFirstOffApex || linkRelation(index) === PARTNER_RELATION ? direction : 0;
      nodes[index].column = column;
    });
  };
  const leftIndexes = nodes.map((_, index) => index).slice(0, apexIndex).reverse();
  const rightIndexes = nodes.map((_, index) => index).slice(apexIndex + 1);
  // A node's link to its apex-side neighbour: on the left that's the step after it, on the right its own step.
  placeBranch(leftIndexes, LEFT, (index) => nodes[index + 1].relation);
  placeBranch(rightIndexes, RIGHT, (index) => nodes[index].relation);

  const leftmostColumn = Math.min(...nodes.map((node) => node.column));
  return nodes.map((node) => ({ ...node, column: node.column - leftmostColumn, row: node.generation - topGeneration }));
}

function connectionNodeRole(index, nodes) {
  if (index === 0) return 'giver';
  if (index === nodes.length - 1) return 'receiver';
  return nodes[index].row === 0 ? 'ancestor' : 'relative';
}

function renderConnectionDiagram(steps) {
  const nodes = layoutConnection(steps);
  const columns = Math.max(...nodes.map((node) => node.column)) + 1;
  const rows = Math.max(...nodes.map((node) => node.row)) + 1;
  const width = DIAGRAM.PADDING * 2 + (columns - 1) * DIAGRAM.COLUMN_WIDTH + DIAGRAM.NODE_WIDTH;
  const height = DIAGRAM.PADDING * 2 + (rows - 1) * DIAGRAM.ROW_HEIGHT + DIAGRAM.NODE_HEIGHT;
  const centreOf = (node) => ({
    x: DIAGRAM.PADDING + node.column * DIAGRAM.COLUMN_WIDTH + DIAGRAM.NODE_WIDTH / 2,
    y: DIAGRAM.PADDING + node.row * DIAGRAM.ROW_HEIGHT + DIAGRAM.NODE_HEIGHT / 2,
  });

  const linkedPairs = nodes.slice(1).map((node, index) => ({
    from: centreOf(nodes[index]),
    to: centreOf(node),
    isPartnerLink: node.relation === PARTNER_RELATION,
  }));
  const links = linkedPairs.map(({ from, to, isPartnerLink }) =>
    `<line class="connection-link${isPartnerLink ? ' connection-link--partner' : ''}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />`);
  // Drawn after the boxes so each heart sits on top of the gap between partners.
  const hearts = linkedPairs
    .filter(({ isPartnerLink }) => isPartnerLink)
    .map(({ from, to }) => `<text class="connection-link__heart" x="${(from.x + to.x) / 2}" y="${from.y}">❤️</text>`);

  const boxes = nodes.map((node, index) => {
    const { x, y } = centreOf(node);
    const lines = wrapLabel(displayName(node.person));
    const firstLineY = y - ((lines.length - 1) * DIAGRAM.LINE_HEIGHT) / 2;
    const text = lines
      .map((line, lineIndex) => `<tspan x="${x}" y="${firstLineY + lineIndex * DIAGRAM.LINE_HEIGHT}">${escapeHtml(line)}</tspan>`)
      .join('');
    return `
      <g class="connection-node connection-node--${connectionNodeRole(index, nodes)}">
        <title>${escapeHtml(node.person === algo.FAMILY_ROOT ? SHARED_ANCESTORS_LABEL : node.person)}</title>
        <rect x="${x - DIAGRAM.NODE_WIDTH / 2}" y="${y - DIAGRAM.NODE_HEIGHT / 2}" width="${DIAGRAM.NODE_WIDTH}" height="${DIAGRAM.NODE_HEIGHT}" rx="${DIAGRAM.NODE_RADIUS}" />
        <text>${text}</text>
      </g>
    `;
  });

  const sizing = `width: max(100%, ${Math.round(width * DIAGRAM.MIN_SCALE)}px); max-width: ${width}px`;
  return `<svg class="connection__svg" viewBox="0 0 ${width} ${height}" style="${sizing}" role="img" aria-label="Family path">${links.join('')}${boxes.join('')}${hearts.join('')}</svg>`;
}

function connectionSummary(connection, giver, receiver) {
  const degrees = degreesOfSeparation(connection.distance);
  if (!connection.relationship) {
    return `${degrees} in the family tree.`;
  }
  return `${displayName(receiver)} is ${displayName(giver)}'s ${connection.relationship}: ${degrees}.`;
}

function connectionDialog() {
  const existingDialog = document.querySelector('[data-connection-dialog]');
  if (existingDialog) {
    return existingDialog;
  }
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="connection" data-connection-dialog aria-labelledby="connection-title">
      <div class="connection__body">
        <form method="dialog"><button class="connection__close" aria-label="Close">✕</button></form>
        <p class="connection__eyebrow">🥓 Six Degrees of Kris Kringle</p>
        <h3 class="connection__title" id="connection-title" data-connection-title></h3>
        <p class="connection__summary" data-connection-summary></p>
        <p class="connection__quip" data-connection-quip></p>
        <div class="connection__diagram" data-connection-diagram></div>
        <p class="connection__legend">Each line is one degree of separation: parent to child, or ❤️ between partners. More degrees means a more distant (and more exciting) match.</p>
      </div>
    </dialog>
  `);
  const dialog = document.querySelector('[data-connection-dialog]');
  // Clicks on the backdrop land on the dialog itself; clicks inside land on .connection__body.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  return dialog;
}

function showConnection(giver, receiver) {
  const connection = algo.getConnection(compiledTree, giver, receiver);
  if (!connection) {
    return;
  }
  const dialog = connectionDialog();
  dialog.querySelector('[data-connection-title]').textContent = `${displayName(giver)} → ${displayName(receiver)}`;
  dialog.querySelector('[data-connection-summary]').textContent = connectionSummary(connection, giver, receiver);
  dialog.querySelector('[data-connection-quip]').textContent = separationQuip(connection);
  const diagramEl = dialog.querySelector('[data-connection-diagram]');
  diagramEl.innerHTML = renderConnectionDiagram(connection.steps);
  dialog.showModal();
  // On narrow screens wide diagrams scroll; start centred on the shared ancestor.
  diagramEl.scrollLeft = (diagramEl.scrollWidth - diagramEl.clientWidth) / 2;
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
      ${node.partner ? `<span class="person__heart" aria-label="and partner">❤️</span><span class="person__name">${escapeHtml(node.partner)}</span>` : ''}
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
        <label for="${id}-partner">❤️ Partner</label>
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
  cardEl.querySelector('[data-action="add"]').addEventListener('click', () => addPerson(node.ID).catch(ignoreReportedApiError));
  cardEl.querySelector('[data-action="remove"]').addEventListener('click', () => removePerson(node.ID).catch(ignoreReportedApiError));
  cardEl.querySelectorAll('[data-field]').forEach((input) => {
    input.addEventListener('change', () => {
      node[input.dataset.field] = input.type === 'checkbox' ? input.checked : input.value;
      personEl.classList.toggle('person--sitting-out', !node.participating);
      api.updatePersonOnServer(node).catch(ignoreReportedApiError);
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

async function removePerson(personID) {
  await api.removePerson(personID);
  algo.removeNode(compiledTree, personID);
  renderTree();
}

/* ---------- Wiring ---------- */

function showApiError(message) {
  const alertEl = document.querySelector('[data-api-error]');
  if (!alertEl) {
    return;
  }
  alertEl.textContent = message;
  alertEl.hidden = false;
}

function listenForControls() {
  document.querySelector('#filter-results').addEventListener('input', applyResultsFilter);
  document.querySelector('#results').addEventListener('click', (event) => {
    const distanceButton = event.target.closest('[data-connection-giver]');
    if (distanceButton) {
      showConnection(distanceButton.dataset.connectionGiver, distanceButton.dataset.connectionReceiver);
    }
  });
  document.querySelector('#generate-results')?.addEventListener('click', displayNewSetOfResults);
  document.querySelector('#add-top-level-person')?.addEventListener('click', () => addPerson(ROOT_PARENT_ID).catch(ignoreReportedApiError));
  window.addEventListener(api.API_ERROR_EVENT, (event) => showApiError(event.detail));

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
