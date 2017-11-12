const exchangeDataFromLastYearKids = [];
const exchangeDataFromLastYearYoungAdults = [];
const exchangeDataFromLastYearAdults = [];
const exchangeDataFromThisYearKids = [];
const exchangeDataFromThisYearYoungAdults = [];
const exchangeDataFromThisYearAdults = [];

function mapPreviousGiftExchangeData(jsonData) {
  const lastYear = new Date().getFullYear() - 1;
  const thisYear = new Date().getFullYear();

  const mapping = {
    [`old guard:kid:${lastYear}`]: exchangeDataFromLastYearKids,
    [`old guard:old guard:${lastYear}`]: exchangeDataFromLastYearAdults,
    [`young adult:young adult:${lastYear}`]: exchangeDataFromLastYearYoungAdults,
    [`old guard:kid:${thisYear}`]: exchangeDataFromThisYearKids,
    [`old guard:old guard:${thisYear}`]: exchangeDataFromThisYearAdults,
    [`young adult:young adult:${thisYear}`]: exchangeDataFromThisYearYoungAdults,
  };

  jsonData.forEach((exchangeDatum) => {
    const mappingKey = `${exchangeDatum.giver_type}:${exchangeDatum.receiver_type}:${exchangeDatum.xmas_year}`;
    const arrayToAddTo = mapping[mappingKey];
    if (arrayToAddTo) {
      arrayToAddTo.push({
        giver: exchangeDatum.giver_name,
        receiver: exchangeDatum.receiver_name,
        socialDistance: exchangeDatum.social_distance,
      });
    }
  });
}

function showFamilyTree() {
  const containerEl = document.querySelector('#tree');
  renderInputs(compiledTree, containerEl)
}

function clearTree() {
  const containerEl = document.querySelector('#tree');
  containerEl.innerHTML = '';
}

function renderInputs(node, parentEl, indexInFamily) {
  let newWrapperEl = parentEl;
  const containerEl = document.querySelector('#tree');
  const inputsDisabled = containerEl.getAttribute('data-disabled') === 'true' ? 'disabled' : '';
  if (node.name !== 'root') {
    const depth = algo.getDepthOfPerson(compiledTree, node.name, 1);
    newWrapperEl = document.createElement('div');
    newWrapperEl.classList.add('node');
    newWrapperEl.setAttribute('data-child-num', indexInFamily);
    newWrapperEl.setAttribute('data-depth', depth);
    newWrapperEl.id = `${node.name}-wrapper`;
    const buttons = !inputsDisabled ? `<button data-action="add" data-node-id="${node.ID}">Add Child</button>
    <button data-action="remove" data-node-id="${node.ID}">Remove Child</button>` : '';

    newWrapperEl.innerHTML = `
      <div class="input-wrapper">
        <div class="input-group">
          <label for="${node.name}">Name</label>
          <input ${inputsDisabled} id="${node.name}-name" data-type="name" type="text" value="${node.name || ''}" />
        </div>
        <div class="input-group">
          <label for="${node.name}-partner">Partner</label>
          <input ${inputsDisabled} id="${node.name}-partner" type="text" data-type="partner" value="${node.partner || ''}" />
        </div>
        <div class="input-group">
          <label for="${node.name}-type">Type</label>
          <input ${inputsDisabled} id="${node.name}-type" type="text" data-type="type" value="${node.type || ''}" />
        </div>
        ${buttons}
      </div>
    `;

    // todo - update tree when inputs change

    newWrapperEl.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const nodeID = e.target.getAttribute('data-node-id');
        const action = e.target.getAttribute('data-action');

        if (action === 'add') {
          const newNodeData = {
            name: '',
            partner: '',
            children: [],
            parent: nodeID
          };
          algo.addChildToNode(compiledTree, nodeID, newNodeData);
          api.addPerson(newNodeData, getCSRF())
        } else if (action === 'remove') {
          algo.removeNode(compiledTree, nodeID);
          api.removePerson(nodeID, getCSRF())
        }

        clearTree();
        showFamilyTree();
      });
    });
    newWrapperEl.querySelectorAll('input').forEach((input) => {
      const nodeID = node.ID;
      input.addEventListener('change', (e) => {
        const propertyKey = e.target.getAttribute('data-type');
        const node = algo.findNodeByID(compiledTree, nodeID);
        node[propertyKey] = e.target.value;
        clearTree();
        showFamilyTree();
        updatePersonOnServer(node, getCSRF());
      });
    });
    parentEl.appendChild(newWrapperEl);
  }

  if (node.children) {
    node.children.forEach((child, indexInFamily) => {
      renderInputs(child, newWrapperEl, indexInFamily);
    });
  }
}

function getCSRF() {
  return document.querySelector('[name="csrf-token"]').getAttribute('content');
}

function addGenerateResultsListener() {
  const generateResultsButton = document.querySelector('#generate-results');
  if (!generateResultsButton) {
    return;
  }
  generateResultsButton.addEventListener('click', () => {
    displayNewSetOfResults();
  });
}

function showResults() {
  if (exchangeDataFromThisYearKids.length && exchangeDataFromThisYearYoungAdults && exchangeDataFromThisYearAdults) {
    showResultsForThisYear();
  } else {
    displayNewSetOfResults();
  }
}

function showResultsForThisYear() {
  const resultsContainer = document.querySelector('#results');
  resultsContainer.innerHTML = generateResultsHTML(exchangeDataFromThisYearKids, 'Kids') +
    generateResultsHTML(exchangeDataFromThisYearYoungAdults, 'Young Adults') +
    generateResultsHTML(exchangeDataFromThisYearAdults, 'Old Guard');
}

function displayNewSetOfResults() {
  const resultForKids = algo.run(compiledTree, 'old guard', 'kid', exchangeDataFromLastYearKids);
  const resultForYoungAdults = algo.run(compiledTree, 'young adult', 'young adult', exchangeDataFromLastYearYoungAdults);
  const resultForAdults = algo.run(compiledTree, 'old guard', 'old guard', exchangeDataFromLastYearAdults);

  const resultsContainer = document.querySelector('#results');
  resultsContainer.innerHTML = generateResultsHTML(resultForKids.result, 'Kids', resultForKids.iterations, resultForKids.executionTime) +
    generateResultsHTML(resultForYoungAdults.result, 'Young Adults', resultForYoungAdults.iterations, resultForYoungAdults.executionTime) +
    generateResultsHTML(resultForAdults.result, 'Adults', resultForAdults.iterations, resultForAdults.executionTime);

  addButtonToSaveResults(resultForKids.result, resultForYoungAdults.result, resultForAdults.result);
}

function addButtonToSaveResults(resultForKids, resultForYoungAdults, resultForAdults) {
  const resultsContainer = document.querySelector('#results');
  resultsContainer.innerHTML += `
   <button class="margin-top-md" data-save-exchanges>Save Kris Kringle Data</button>
  `;
  resultsContainer.querySelector('[data-save-exchanges]').addEventListener('click', (e) => {
    const currentYear = new Date().getFullYear();
    const allExchanges = [];
    resultForKids.forEach((exchange) => {
      allExchanges.push({
        xmas_year: currentYear,
        giver_type: 'old guard',
        receiver_type: 'kid',
        giver_name: exchange.giver,
        receiver_name: exchange.receiver,
        social_distance: exchange.socialDistance,
      });
    });
    resultForYoungAdults.forEach((exchange) => {
      allExchanges.push({
        xmas_year: currentYear,
        giver_type: 'young adult',
        receiver_type: 'young adult',
        giver_name: exchange.giver,
        receiver_name: exchange.receiver,
        social_distance: exchange.socialDistance,
      });
    });
    resultForAdults.forEach((exchange) => {
      allExchanges.push({
        xmas_year: currentYear,
        giver_type: 'old guard',
        receiver_type: 'old guard',
        giver_name: exchange.giver,
        receiver_name: exchange.receiver,
        social_distance: exchange.socialDistance,
      });
    });
    api.saveGiftExchanges(allExchanges, getCSRF(), currentYear);
  });
}

function generateResultsHTML(results, resultType, iterations, executionTime) {
  const tableHTML = `<table>
      <thead>
        <tr>
          <th>Giver</th>
          <th>Receiver</th>
          <th>Social Distance</th>
        </tr>
      </thead>
      <tbody>
        ${
          results.map((result) => {
            return `
              <tr>
                <td data-giver="${result.giver.toLowerCase()}">${result.giver}</td>
                <td data-receiver="${result.receiver.toLowerCase()}">${result.receiver}</td>
                <td>${result.socialDistance}</td>
              </tr>
            `;
          }).join('')
        }
      </tbody>
    </table>
  `;
  const performanceStats = iterations ? `<p>Generated after ${iterations} iterations in ${executionTime} ms</p>` : '';
  return `<h2>Results for ${resultType}</h2>
  ${performanceStats}
  ${tableHTML}
  `;
}

function addResultsFiltering() {
  const filterInput = document.querySelector('#filter-results');
  filterInput.addEventListener('keypress', (e) => {
    const resultsTableRows = document.querySelectorAll('#results tbody tr');
    resultsTableRows.forEach((tableRow) => {
      const containsPersonName = tableRow.querySelector(`[data-giver*="${filterInput.value.toLowerCase()}"], [data-receiver*="${filterInput.value.toLowerCase()}"]`);
      if (containsPersonName) {
        tableRow.style.display = 'table-row';
      } else {
        tableRow.style.display = 'none';
      }
    });
  });
}

let compiledTree;

async function displayEverything() {
  compiledTree = await api.fetchFamilyMemberData();
  const exchangeDataRaw = await fetchGiftExchangeData();
  mapPreviousGiftExchangeData(exchangeDataRaw);
  showFamilyTree();
  showResults();
  addResultsFiltering();
  addGenerateResultsListener();
}

displayEverything();
