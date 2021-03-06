const NO_RECIPIENT = 'NO-ONE';

function compileTree(jsonData) {
  const oldGuard = jsonData.filter((familyMember) => familyMember.parent_id === null).map(compileNode);
  const outputTree = {
    type: 'root',
    id: 'root',
    name: 'root',
    children: oldGuard
  };

  jsonData.forEach((familyMember) => {
    if (familyMember.parent_id) {
      const parent = findNodeByID(outputTree, familyMember.parent_id);
      if (parent) {
        parent.children.push(compileNode(familyMember));
      } else {
        debugger;
      }
    }
  });
  return outputTree;
}

function compileNode(nodeData) {
  return {
    ID: nodeData.id,
    name: nodeData.name,
    partner: nodeData.partner,
    type: nodeData.family_member_type,
    parent: nodeData.parent_id,
    participating: nodeData.participating_this_year === 'true',
    children: []
  };
}

function addChildToNode(tree, nodeID, childData) {
  const node = findNodeByID(tree, nodeID);
  if (!node.children) {
    node.children = [];
  }
  node.children.push(childData);
}

function removeNode(tree, nodeID) {
  const node = findNodeByID(tree, nodeID);
  const parentNode = findNodeByID(tree, node.parent);
  let indexOfChildNode = parentNode.children.reduce((result, child, index) => {
    if (child.ID.toString() === nodeID.toString()) {
      return index;
    }
    return result;
  }, -1);
  parentNode.children.splice(indexOfChildNode, 1);
}

function bfs(node, visitingFunction) {
  visitingFunction(node);
  if (node.children) {
    node.children.forEach((child) => {
      bfs(child, visitingFunction);
    })
  }
}

function dfs(node, visitingFunction) {
  if (node.children) {
    node.children.forEach((child) => {
      dfs(child, visitingFunction);
    });
  }
  visitingFunction(node);
}

function treeDepth(tree) {
  let count = 0;
  dfs(tree, (node) => {
    if (node.name) {
      count += node.partner ? 2 : 1;
    }
  });
  return count;
}

function getDepthOfPerson(tree, name, currentDepth) {
  if (tree.children) {
    if (hasChildWithName(tree, name)) {
      return currentDepth;
    }

    let result = -1;
    tree.children.some((node) => {
      const newDepth = getDepthOfPerson(node, name, currentDepth + 1);
      if (newDepth > -1) {
        result = newDepth;
        return true;
      }
    });
    return result;
  }
  return -1;
}

// todo - this needs to handle grandparents
function hasSharedParent(tree, name1, name2) {
  const node1 = findNode(tree, name1);
  const node2 = findNode(tree, name2);

  let parent1Node = findNodeByID(tree, node1.parent);
  let parent2Node = findNodeByID(tree, node2.parent);

  if (parent1Node && parent1Node.type === 'root') {
    parent1Node = node1;
  }
  if (parent2Node && parent2Node.type === 'root') {
    parent2Node = node2;
  }

  return parent1Node.name === parent2Node.name || isParentOf(tree, parent1Node.name, parent2Node.name) || isParentOf(tree, parent2Node.name, parent1Node.name);
}

function findNode(tree, name) {
  let result;
  bfs(tree, (node) => {
    if (node.name === name || node.partner === name) {
      result = node;
    }
  });
  return result;
}

function findNodeByID(tree, ID) {
  let result;
  if (!ID || ID === 'root') {
    return tree;
  }
  bfs(tree, (node) => {
    if (node.ID && node.ID.toString() === ID.toString()) {
      result = node;
    }
  });
  return result;
}

// todo handle grandchildren
function isParentOf(tree, potentialParent, potentialDescendent) {
  const potentialParentNode = findNode(tree, potentialParent);
  return hasChildWithName(potentialParentNode, potentialDescendent);
}

function hasChildWithName(node, name) {
  if (!node || !node.children) {
    return false;
  }
  return node.children.some((child) => child.name === name || child.partner === name);
}

function arePartners(tree, person1, person2) {
  const person1Node = findNode(tree, person1);
  return (person1Node.name === person1 && person1Node.partner === person2) || (person1Node.partner === person1 && person1Node.name === person2);
}

function socialDistance(tree, person1, person2) {
  if (!person1 || !person2) {
    return 0;
  }

  if (arePartners(tree, person1, person2)) {
    return 0;
  }

  const depthPerson1 = Math.pow(getDepthOfPerson(tree, person1, 1), 1);
  const depthPerson2 = Math.pow(getDepthOfPerson(tree, person2, 1), 1);

  if (isParentOf(tree, person1, person2) || isParentOf(tree, person2, person1)) {
    return Math.abs(depthPerson1 - depthPerson2);
  }

  if (hasSharedParent(tree, person1, person2)) {
    if (depthPerson1 + depthPerson2 === 2) {
      // top level adults can buy for each other
      return 3;
    }

    if (!areBloodRelatives(tree, person1, person2)) {
      return 4;
    }
    return 0;
  }

  const baseDistance = areBloodRelatives(tree, person1, person2) ? 2 : 3;
  return Math.pow(baseDistance + Math.abs(depthPerson1 - depthPerson2), 2);
}

function areBloodRelatives(tree, person1, person2) {
  const person1Node = findNode(tree, person1);
  const person2Node = findNode(tree, person2);
  // the blood relative gets to be the "name" whereas relatives in law
  // will be in the "partner" property
  return (person1Node.name === person1 && person2Node.name === person2);
}

function getExchangeForGiver(exchanges, giverName) {
  return exchanges.find((exchange) => exchange.giver === giverName);
}

function getExchangeForReceiver(exchanges, receiverName) {
  return exchanges.find((exchange) => exchange.receiver === receiverName);
}

function getAllParticipatingPeopleInTree(tree, type) {
  const people = [];
  dfs(tree, (node) => {
    if (node.name && node.type === type && node.participating) {
      people.push(node.name);
    }
    if (node.partner && node.type === type && node.participating) {
      people.push(node.partner);
    }
  });
  return people;
}

const MIN_DISTANCE_THRESHOLD_FOR_EXCHANGE = 2;

function shuffleArray(arr) {
  const shuffledArray = arr.slice(0);
  return shuffledArray.sort((a, b) => Math.random() > 0.5 ? -1 : 1);
}

function checkNoRepeatGiving(thisYearExchanges, lastYearExchanges) {
  return thisYearExchanges.every((exchange) => {
    const hasRepeatGiving = lastYearExchanges.find((exchangeToCheck) => JSON.stringify(exchange) === JSON.stringify(exchangeToCheck));
    return !hasRepeatGiving;
  });
}

function checkNoRecursiveGiving(exchanges) {
  return exchanges.every(exchange => {
    const hasRecursiveGiving = exchanges.find(
      exchangeToCheck =>
        exchangeToCheck.giver === exchange.receiver &&
        exchangeToCheck.receiver === exchange.giver
    );
    return !hasRecursiveGiving;
  });
}

function arrayDiff(array1, array2) {
  const missingItems = [];
  array1.forEach((item) => {
    if (!array2.includes(item)) {
      missingItems.push(item);
    }
  });

  return missingItems;
}

const MAX_ITERATIONS = 10;
/**
 * Generates matches. Performs a double check to make sure there is no repeat giving.
 */
function run(familyTree, typeGiver, typeReceiver, exchangeDataFromPreviousYear) {
  let result;
  let isValidResult = false;
  let iterations = 0;
  const startTime = new Date();
  while (!isValidResult && iterations < MAX_ITERATIONS) {
    result = generateMatches(familyTree, typeGiver, typeReceiver, exchangeDataFromPreviousYear);
    iterations++;
    const possibleRecipients = getAllParticipatingPeopleInTree(familyTree, typeReceiver).sort();
    const possibleGivers = getAllParticipatingPeopleInTree(familyTree, typeGiver).sort();
    const giversInResult = result.map((exchange) => exchange.giver).sort();
    const receiversInResult = result.map((exchange) => exchange.receiver).sort();

    const missingRecipients = arrayDiff(possibleRecipients, receiversInResult);
    if (missingRecipients.length) {
      continue;
    }

    const missingGivers = arrayDiff(possibleGivers, giversInResult);
    if (missingGivers.length) {
      continue;
    }

    isValidResult = checkNoRepeatGiving(result, exchangeDataFromPreviousYear) && checkNoRecursiveGiving(result);
  }

  if (!isValidResult) {
    result = [];
  }
  const finishTime = new Date();
  const executionTime = finishTime - startTime;
  return {
    result,
    iterations,
    executionTime,
  };
}

function swapRecipientsAround(exchanges, currentGiver, familyTree) {
  // stuck here because this person can only buy for themselves now
  // swap with the first one
  const exchangeToSwapWith = exchanges.find((exchange) => {
    const distance = socialDistance(familyTree, currentGiver, exchange.receiver);
    return distance > MIN_DISTANCE_THRESHOLD_FOR_EXCHANGE;
  });
  const recipientToSwapAround = exchangeToSwapWith.receiver;
  exchangeToSwapWith.receiver = currentGiver;
  exchanges.push({
    giver: currentGiver,
    receiver: recipientToSwapAround,
    socialDistance: socialDistance(familyTree, currentGiver, recipientToSwapAround)
  });
}

/**
 * Generates possible kris kringle matches adhering to the following business rules:
 * 1. Kids shouldn't buy for parents, partners shouldn't buy for each other
 * 2. People shouldn't buy for the same person they bought for the previous year
 * 3. No recursive gift giving allowed
 * 4. Financial situation should be respected so that young adults don't have to buy too many gifts
 * 5. Any left over people should be assigned to a leftover pool
 * @param  {Object} familyTree  A compiled family tree
 * @param  {string} typeGiver  e.g. young adult/kid/adult
 * @param  {string} typeReceiver  e.g. young adult/kid/adult
 * @param  {Array<{giver: string, receiver: string}>} exchangeDataFromPreviousYear  Matches from previous year
 * @return {Array<{giver: string, receiver: string}>}  Best guess at matches
 */
function generateMatches(familyTree, typeGiver, typeReceiver, exchangeDataFromPreviousYear) {
  const exchanges = [];
  const numPossibleExchanges = treeDepth(familyTree);

  let numAttempts = 0;
  let possibleRecipients = shuffleArray(getAllParticipatingPeopleInTree(familyTree, typeReceiver));
  let possibleGivers = shuffleArray(getAllParticipatingPeopleInTree(familyTree, typeGiver));
  let possibleRecipientsForThisGiver = possibleRecipients.slice(0);
  let currentGiver = possibleGivers[0];
  while (possibleGivers.length > 0) {
    possibleRecipientsForThisGiver.forEach((possibleRecipient, index) => {
      if (possibleRecipient === currentGiver) {
        if (possibleRecipientsForThisGiver.length > 1) {
          return;
        }
        // The only possible recipient is the same person as the giver
        // Swap one of the other recipients for the current giver and then
        // the giver can give to the person they swapped with.
        swapRecipientsAround(exchanges, currentGiver, familyTree);
        const indexOfGiver = possibleGivers.indexOf(currentGiver);
        if (indexOfGiver !== -1) {
          possibleGivers.splice(indexOfGiver, 1);
        }
        const indexOfReceiver = possibleRecipients.indexOf(currentGiver);
        if (indexOfReceiver !== -1) {
          possibleRecipients.splice(indexOfReceiver, 1);
        }
        if (possibleGivers.length > 0) {
          currentGiver = possibleGivers[0];
          possibleRecipientsForThisGiver = possibleRecipients.slice(0);
        }
        return;
      }
      const distance = socialDistance(familyTree, currentGiver, possibleRecipient);
      const personWhoIsBuyingForGiver = getExchangeForReceiver(exchanges, currentGiver);
      const recursiveGiving = personWhoIsBuyingForGiver && personWhoIsBuyingForGiver.giver === possibleRecipient;
      const exchangeFromLastYear = getExchangeForGiver(exchangeDataFromPreviousYear, currentGiver);
      const boughtForSamePersonLastYear = exchangeFromLastYear && exchangeFromLastYear.receiver === possibleRecipient;

      if (distance > MIN_DISTANCE_THRESHOLD_FOR_EXCHANGE && !recursiveGiving && !boughtForSamePersonLastYear) {
        exchanges.push({
          giver: currentGiver,
          receiver: possibleRecipient,
          socialDistance: distance
        });
        const indexOfReceiver = possibleRecipients.indexOf(possibleRecipient);
        possibleRecipients.splice(indexOfReceiver, 1);
        const indexOfGiver = possibleGivers.indexOf(currentGiver);
        possibleGivers.splice(indexOfGiver, 1);

        if (possibleGivers.length > 0) {
          currentGiver = possibleGivers[0];
          possibleRecipientsForThisGiver = possibleRecipients.slice(0);
        }
      } else {
        // recipient is too close to giver. Take them off the list of possibilities.
        const indexOfReceiver = possibleRecipientsForThisGiver.indexOf(possibleRecipient);
        possibleRecipientsForThisGiver.splice(indexOfReceiver, 1);
      }
    });

    if (!possibleRecipientsForThisGiver.length) {
      const exchangeFromLastYear = getExchangeForGiver(exchangeDataFromPreviousYear, currentGiver);
      const boughtForNoOneLastYear = !exchangeFromLastYear || exchangeFromLastYear.receiver === NO_RECIPIENT;

      if (!boughtForNoOneLastYear) {
        exchanges.push({
          giver: currentGiver,
          receiver: NO_RECIPIENT,
          socialDistance: '?',
        });
      } else {
        // don't want to buy for no-one two years in a row
        // find someone who bought for someone last year and is buying for someone this year as well
        const exchangeToSwapWith = exchanges.find((exchange) => {
          if (exchange.receiver !== NO_RECIPIENT) {
            return exchangeDataFromPreviousYear.find((exchangeToCheck) => {
              return exchangeToCheck.giver === exchange.giver && exchange.receiver !== NO_RECIPIENT;
            });
          }
        });

        if (exchangeToSwapWith) {
          const oldGiver = exchangeToSwapWith.giver;
          exchangeToSwapWith.giver = currentGiver;
          exchangeToSwapWith.socialDistance = socialDistance(familyTree, currentGiver, exchangeToSwapWith.receiver);
          exchanges.push({
            giver: oldGiver,
            receiver: NO_RECIPIENT,
            socialDistance: '?'
          });
        } else {
          exchanges.push({
            giver: currentGiver,
            receiver: NO_RECIPIENT,
            socialDistance: '?',
          });
        }
      }
      const indexOfGiver = possibleGivers.indexOf(currentGiver);
      possibleGivers.splice(indexOfGiver, 1);

      if (possibleGivers.length) {
        currentGiver = possibleGivers[0];
        possibleRecipientsForThisGiver = possibleRecipients.slice(0);
      }
    }
  }

  return exchanges;
}

const facade = {
  run,
  dfs,
  bfs,
  treeDepth,
  socialDistance,
  getDepthOfPerson,
  hasSharedParent,
  isParentOf,
  compileTree,
  addChildToNode,
  findNode,
  findNodeByID,
  removeNode
};

if (typeof module !== 'undefined') {
  module.exports = facade;
} else {
  window.algo = facade;
}
