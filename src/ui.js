const testData = {
  type: 'root',
  name: 'root',
  ID: 'root',
  children: [
    {
      name: 'Judy McGannon',
      partner: 'Peter Nagel',
      type: 'old guard',
      children: [
        {
          name: 'Jeremy Nagel',
          partner: 'Sandy Xu',
          type: 'young adult',
          children: [
            {
              name: 'Fake Kid',
              type: 'kid'
            }
          ]
        },
        {
          name: 'Alice Nagel',
          type: 'young adult'
        },
        {
          name: 'Matt Nagel',
          partner: 'Karen',
          type: 'young adult'
        }
      ]
    },
    {
      name: 'Jane Fleming',
      partner: 'Tim Fleming',
      type: 'old guard',
      children: [
        {
          name: 'William Fleming',
          partner: 'Will GF',
          type: 'young adult'
        },
        {
          name: 'Ruby Fleming',
          partner: 'Jack Someone',
          type: 'young adult'
        },
        {
          name: 'George Fleming',
          type: 'kid'
        },
        {
          name: 'Xavier Fleming',
          type: 'kid'
        },
        {
          name: 'Fred Fleming',
          type: 'kid'
        }
      ]
    },
    {
      name: 'Dan McGannon',
      partner: 'Anne Rosamillia',
      type: 'old guard',
      children: [
        {
          name: 'Claire McGannon',
          partner: 'Ash',
          type: 'young adult'
        },
        {
          name: 'Elena McGannon',
          partner: 'Matt',
          type: 'young adult'
        },
        {
          name: 'Francisca McGannon',
          type: 'young adult'
        },
        {
          name: 'James McGannon',
          type: 'kid'
        }
      ]
    },
    {
      name: 'Emily Maher',
      partner: 'Peter Maher',
      type: 'old guard',
      children: [
        {
          name: 'Oliver Maher',
          type: 'kid'
        },
        {
          name: 'Patrick Maher',
          type: 'kid'
        }
      ]
    },
    {
      name: 'Maryanne McGannon',
      partner: 'Dan',
      type: 'old guard'
    }
  ]
};

const compiledTree = algo.compileTree(testData);

const containerEl = document.querySelector('#tree');
renderInputs(compiledTree, containerEl)

function clearTree() {
  containerEl.innerHTML = '';
}

function renderInputs(node, parentEl, indexInFamily) {
  let newWrapperEl = parentEl;
  if (node.name !== 'root') {
    const depth = algo.getDepthOfPerson(compiledTree, node.name, 1);
    newWrapperEl = document.createElement('div');
    newWrapperEl.classList.add('node');
    newWrapperEl.setAttribute('data-child-num', indexInFamily);
    newWrapperEl.setAttribute('data-depth', depth);
    newWrapperEl.id = `${node.name}-wrapper`;
    newWrapperEl.innerHTML = `
      <div class="input-wrapper">
        <div class="input-group">
          <label for="${node.name}">Name</label>
          <input id="${node.name}-name" data-type="name" type="text" value="${node.name || ''}" />
        </div>
        <div class="input-group">
          <label for="${node.name}-partner">Partner</label>
          <input id="${node.name}-partner" type="text" data-type="partner" value="${node.partner || ''}" />
        </div>
        <div class="input-group">
          <label for="${node.name}-type">Type</label>
          <input id="${node.name}-type" type="text" data-type="type" value="${node.type || ''}" />
        </div>
        <button data-action="add" data-node-id="${node.ID}">Add Child</button>
        <button data-action="remove" data-node-id="${node.ID}">Remove Child</button>
      </div>
    `;

    // todo - update tree when inputs change

    newWrapperEl.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const nodeID = e.target.getAttribute('data-node-id');
        const action = e.target.getAttribute('data-action');

        if (action === 'add') {
          algo.addChildToNode(compiledTree, nodeID, {
            name: '',
            partner: '',
            children: [],
            parent: nodeID
          });
        } else if (action === 'remove') {
          algo.removeNode(compiledTree, nodeID);
        }

        clearTree();
        renderInputs(compiledTree, containerEl);
      });
    });
    newWrapperEl.querySelectorAll('input').forEach((input) => {
      const nodeName = node.name;
      input.addEventListener('change', (e) => {
        const propertyKey = e.target.getAttribute('data-type');
        const node = algo.findNode(compiledTree, nodeName);
        node[propertyKey] = e.target.value;
        clearTree();
        renderInputs(compiledTree, containerEl);
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


const exchangeDataFromLastYearYoungAdults = [ { giver: 'Jeremy Nagel', receiver: 'William Fleming' },
  { giver: 'Ruby Fleming', receiver: 'Claire McGannon' },
  { giver: 'Elena McGannon', receiver: 'Jeremy Nagel' },
  { giver: 'Alice Nagel', receiver: 'Will GF' },
  { giver: 'Jack Someone', receiver: 'Ash' },
  { giver: 'Matt', receiver: 'Sandy Xu' },
  { giver: 'Matt Nagel', receiver: 'Ruby Fleming' },
  { giver: 'Claire McGannon', receiver: 'Alice Nagel' },
  { giver: 'Karen', receiver: 'Jack Someone' },
  { giver: 'Ash', receiver: 'Matt Nagel' },
  { giver: 'William Fleming', receiver: 'Elena McGannon' },
  { giver: 'Francisca McGannon', receiver: 'Karen' },
  { giver: 'Will GF', receiver: 'Matt' },
  { giver: 'Sandy Xu', receiver: 'Francisca McGannon' } ];

const exchangeDataFromLastYearAdults = [ { giver: 'Judy McGannon', receiver: 'Jane Fleming' },
  { giver: 'Dan McGannon', receiver: 'Emily Maher' },
  { giver: 'Maryanne McGannon', receiver: 'Judy McGannon' },
  { giver: 'Jane Fleming', receiver: 'Dan McGannon' },
  { giver: 'Emily Maher', receiver: 'Maryanne McGannon' },
  { giver: 'Peter Nagel', receiver: 'Tim Fleming' },
  { giver: 'Anne Rosamillia', receiver: 'Peter Maher' },
  { giver: 'Dan', receiver: 'Peter Nagel' },
  { giver: 'Tim Fleming', receiver: 'Anne Rosamillia' },
  { giver: 'Peter Maher', receiver: 'Dan' } ];

const exchangeDataFromLastYearKids = [ { giver: 'Judy McGannon', receiver: 'George Fleming' },
  { giver: 'Jane Fleming', receiver: 'James McGannon' },
  { giver: 'Dan McGannon', receiver: 'Oliver Maher' },
  { giver: 'Emily Maher', receiver: 'Fake Kid' },
  { giver: 'Peter Nagel', receiver: 'Xavier Fleming' },
  { giver: 'Tim Fleming', receiver: 'Patrick Maher' },
  { giver: 'Peter Maher', receiver: 'Fred Fleming' },
  { giver: 'Anne Rosamillia', receiver: 'NO-ONE' },
  { giver: 'Maryanne McGannon', receiver: 'NO-ONE' },
  { giver: 'Dan', receiver: 'NO-ONE' } ];

document.querySelector('#generate-results').addEventListener('click', () => {
  const resultForKids = algo.run(compiledTree, 'old guard', 'kid', exchangeDataFromLastYearKids);
  const resultForYoungAdults = algo.run(compiledTree, 'young adult', 'young adult', exchangeDataFromLastYearYoungAdults);
  const resultForAdults = algo.run(compiledTree, 'old guard', 'old guard', exchangeDataFromLastYearAdults);

  const resultsContainer = document.querySelector('#results');
  resultsContainer.innerHTML = generateResultsHTML(resultForKids, 'Kids') +
    generateResultsHTML(resultForYoungAdults, 'Young Adults') +
    generateResultsHTML(resultForAdults, 'Adults');
});

function generateResultsHTML(results, resultType) {
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
          results.result.map((result) => {
            return `
              <tr>
                <td>${result.giver}</td>
                <td>${result.receiver}</td>
                <td>${result.socialDistance}</td>
              </tr>
            `;
          }).join('')
        }
      </tbody>
    </table>
  `;
  return `<h2>Results for ${resultType}</h2>
  <p>Generated after ${results.iterations} iterations in ${results.executionTime} ms</p>
  ${tableHTML}
  `;
}
