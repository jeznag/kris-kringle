const NO_RECIPIENT = "NO-ONE";

function compileTree(jsonData) {
  const oldGuard = jsonData
    .filter(familyMember => familyMember.parent_id === null)
    .map(compileNode);
  const outputTree = {
    type: "root",
    id: "root",
    name: "root",
    children: oldGuard
  };

  const unmatchedFamilyMembers = [];

  jsonData.forEach(familyMember => {
    if (familyMember.parent_id) {
      const parent = findNodeByID(outputTree, familyMember.parent_id);
      if (parent) {
        parent.children.push(compileNode(familyMember));
      } else {
        unmatchedFamilyMembers.push(familyMember);
      }
    }
  });

  // try again with unmatched
  unmatchedFamilyMembers.forEach(familyMember => {
    if (familyMember.parent_id) {
      const parent = findNodeByID(outputTree, familyMember.parent_id);
      if (parent) {
        parent.children.push(compileNode(familyMember));
      } else {
        debugger
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
    participating: nodeData.participating_this_year === "true",
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
    node.children.forEach(child => {
      bfs(child, visitingFunction);
    });
  }
}

function dfs(node, visitingFunction) {
  if (node.children) {
    node.children.forEach(child => {
      dfs(child, visitingFunction);
    });
  }
  visitingFunction(node);
}

function treeDepth(tree) {
  let count = 0;
  dfs(tree, node => {
    if (node.name) {
      count += node.partner ? 2 : 1;
    }
  });
  return count;
}

function getDistanceFromRoot(tree, name) {
  let count = 0;
  let found = false;
  bfs(tree, node => {
    if (!found) {
      if (node.name !== name && node.partner !== name) {
        count += 1;
      }

      if (node.name === name) {
        count += 1;
        found = true;
      }

      if (node.partner === name) {
        count += 5;
        found = true;
      }
    }
  });
  return count;
}

function nodeContainsName(nodeToCheck, nameToFind) {
  let containsName = false;
  dfs(nodeToCheck, nodeBeingVisited => {
    if (nodeBeingVisited.name === nameToFind || nodeBeingVisited.partner === nameToFind) {
      containsName = true;
    }
  });

  return containsName;
}

function getLowestCommonAncestor(tree, name1, name2) {
  let deepestNode = { depth: -1, node: tree };
  dfs(tree, nodeBeingVisited => {
    if (nodeContainsName(nodeBeingVisited, name1) && nodeContainsName(nodeBeingVisited, name2)) {
      const depth = getDepthOfPerson(tree, nodeBeingVisited.name, 0);

      if (deepestNode.depth < depth) {
        deepestNode = { node: nodeBeingVisited, depth };
      }
    }
  });

  return deepestNode.node;
}

function getDepthOfPerson(tree, name, currentDepth) {
  if (tree.children) {
    if (hasChildWithName(tree, name)) {
      return currentDepth;
    }

    let result = -1;
    tree.children.some(node => {
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

function findNode(tree, name) {
  let result;
  bfs(tree, node => {
    if (node.name === name || node.partner === name) {
      result = node;
    }
  });
  return result;
}

function findNodeByID(tree, ID) {
  let result;
  if (!ID || ID === "root") {
    return tree;
  }
  bfs(tree, node => {
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
  return node.children.some(
    child => child.name === name
  );
}

function arePartners(tree, person1, person2) {
  const person1Node = findNode(tree, person1);
  return (
    (person1Node.name === person1 && person1Node.partner === person2) ||
    (person1Node.partner === person1 && person1Node.name === person2)
  );
}

function areSiblings(tree, person1, person2) {
  const node1 = findNode(tree, person1);

  if (node1.partner === person1) {
    return false;
  }

  const parent = findNodeByID(tree, node1.parent);

  return parent.children.find((child) => child.name === person2);
}

function areParentChild(tree, person1, person2) {
  return isParentOf(tree, person1, person2) || isParentOf(tree, person2, person1);
}

function socialDistance(tree, person1, person2) {
  if (!person1 || !person2) {
    return 0;
  }

  if (arePartners(tree, person1, person2)) {
    return 0;
  }

  if (areSiblings(tree, person1, person2)) {
    return 2;
  }

  if (areParentChild(tree, person1, person2)) {
    return 2;
  }

  const distanceFromRoot1 = getDistanceFromRoot(tree, person1);
  const distanceFromRoot2 = getDistanceFromRoot(tree, person2);
  const lowestCommonAncestor = getLowestCommonAncestor(tree, person1, person2);
  if (!lowestCommonAncestor) {
    return 99;
  }
  const ancestorDistanceFromRoot = getDistanceFromRoot(tree, lowestCommonAncestor.name);

  return distanceFromRoot1 + distanceFromRoot2 - 2 * ancestorDistanceFromRoot;
}

function areBloodRelatives(tree, person1, person2) {
  const person1Node = findNode(tree, person1);
  const person2Node = findNode(tree, person2);
  // the blood relative gets to be the "name" whereas relatives in law
  // will be in the "partner" property
  return person1Node.name === person1 && person2Node.name === person2;
}

function getExchangeForGiver(exchanges, giverName) {
  return exchanges.find(exchange => areNamesSimilar(exchange.giver, giverName));
}

function getExchangeForReceiver(exchanges, receiverName) {
  return exchanges.find(exchange => areNamesSimilar(exchange.receiver, receiverName));
}

function getAllParticipatingPeopleInTree(tree, type) {
  const people = [];
  dfs(tree, node => {
    if (node.name && node.type === type && node.participating) {
      people.push(node.name);
    }
    if (node.partner && node.type === type && node.participating) {
      people.push(node.partner);
    }
  });
  return people;
}

let MIN_DISTANCE_THRESHOLD_FOR_EXCHANGE = 10;

function shuffleArray(arr) {
  const shuffledArray = arr.slice(0);
  return shuffledArray.sort((a, b) => (Math.random() > 0.5 ? -1 : 1));
}

// List of honorifics and descriptors to remove
const honorifics = ["Sage", "Esteemed", "Wise One", "Dr", "Padawan", "Fleetfoot", "Long Bready Hair", 'Seneschal'];

// Function to clean a name by removing honorifics
function cleanName(name) {
  let cleanedName = name;
  honorifics.forEach(honorific => {
    const regex = new RegExp(`\\b${honorific}\\b`, 'gi');
    cleanedName = cleanedName.replace(regex, '').trim();
  });
  return cleanedName.replace(/\s+/g, ' '); // remove extra spaces
}

// Existing Levenshtein distance function
function levenshteinDistance(str1, str2) {
  const dp = Array(str1.length + 1)
    .fill(null)
    .map(() => Array(str2.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= str2.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= str1.length; i += 1) {
    for (let j = 1; j <= str2.length; j += 1) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // Deletion
        dp[i][j - 1] + 1, // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  return dp[str1.length][str2.length];
}

// Function to check if two names are similar based on a threshold
function areNamesSimilar(name1, name2, threshold = 3) {
  const cleanedName1 = cleanName(name1);
  const cleanedName2 = cleanName(name2);
  const distance = levenshteinDistance(cleanedName1, cleanedName2);
  return distance <= threshold; // Adjust threshold as needed
}

// Main function to check for repeat giving
function checkNoRepeatGiving(thisYearExchanges, lastYearExchanges) {
  return thisYearExchanges.every(exchange => {
    let foundLastYearMatch = null;
    lastYearExchanges.find(exchangeToCheck => {
      const giverSimilar = areNamesSimilar(exchange.giver, exchangeToCheck.giver);

      // Log both records for comparison if the giver matches
      if (giverSimilar) {
        foundLastYearMatch = true;
        // console.log(`  [Same Giver Found] This year: ${exchange.giver} -> ${exchange.receiver}`);
        // console.log(`                       Last year: ${exchangeToCheck.giver} -> ${exchangeToCheck.receiver}`);
      }

      return giverSimilar;
    });

    if (!foundLastYearMatch) {
      console.log('No match found for', exchange.giver);
    }

    const hasRepeatGivingThisYear =
      thisYearExchanges.filter(
        exchangeToCheck => areNamesSimilar(exchangeToCheck.giver, exchange.giver)
      ).length > 1;

    const gaveToSamePersonLastYear = lastYearExchanges.find(
      exchangeToCheck =>
        areNamesSimilar(exchange.giver, exchangeToCheck.giver) &&
        areNamesSimilar(exchange.receiver, exchangeToCheck.receiver)
    );

    return !gaveToSamePersonLastYear && !hasRepeatGivingThisYear;
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
  array1.forEach(item => {
    if (!array2.includes(item)) {
      missingItems.push(item);
    }
  });

  return missingItems;
}

const MAX_ITERATIONS = 50;
/**
 * Generates matches. Performs a double check to make sure there is no repeat giving.
 */
function run(
  familyTree,
  typeGiver,
  typeReceiver,
  exchangeDataFromPreviousYear
) {
  let result;
  let isValidResult = false;
  let iterations = 0;
  const startTime = new Date();
  let bestResult = { totalDistance: 0 };

  const recipients = getAllParticipatingPeopleInTree(
    familyTree,
    typeReceiver
  );

  if (recipients.length === 0) {
    return {
      result: [],
      iterations: 0,
      executionTime: 0
    };
  }

  const MAX_DURATION = 10000;

  while (iterations < MAX_ITERATIONS && (new Date() - startTime) < MAX_DURATION) {
    MIN_DISTANCE_THRESHOLD_FOR_EXCHANGE = 10;
    result = generateMatches(
      familyTree,
      typeGiver,
      typeReceiver,
      exchangeDataFromPreviousYear
    );

    iterations++;
    const possibleRecipients = getAllParticipatingPeopleInTree(
      familyTree,
      typeReceiver
    ).sort();
    const possibleGivers = getAllParticipatingPeopleInTree(
      familyTree,
      typeGiver
    ).sort();
    const giversInResult = result.map(exchange => exchange.giver).sort();
    const receiversInResult = result.map(exchange => exchange.receiver).sort();

    const missingRecipients = arrayDiff(possibleRecipients, receiversInResult);
    if (missingRecipients.length) {
      continue;
    }

    const missingGivers = arrayDiff(possibleGivers, giversInResult);
    if (missingGivers.length) {
      continue;
    }

    isValidResult =
      checkNoRepeatGiving(result, exchangeDataFromPreviousYear) &&
      checkNoRecursiveGiving(result);

    if (isValidResult) {
      const processedResult = result.map(exchange => {
        return {
          ...exchange,
          socialDistance: socialDistance(
            familyTree,
            exchange.giver,
            exchange.receiver
          )
        };
      });

      const totalDistance = processedResult.reduce(
        (total, exchange) => total + exchange.socialDistance,
        0
      );

      if (totalDistance > bestResult.totalDistance) {
        bestResult = {
          totalDistance,
          exchanges: result
        };
      }
    }
  }

  const finishTime = new Date();
  const executionTime = finishTime - startTime;

  console.log('executionTime', executionTime);

  if (!bestResult.totalDistance) {
    return {
      result: [],
      iterations,
      executionTime
    };
  }
  return {
    result: bestResult.exchanges,
    iterations,
    executionTime
  };
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
function generateMatches(
  familyTree,
  typeGiver,
  typeReceiver,
  exchangeDataFromPreviousYear,
  attempts = 0
) {
  if (attempts > 50) {
    MIN_DISTANCE_THRESHOLD_FOR_EXCHANGE -= 1;

    if (MIN_DISTANCE_THRESHOLD_FOR_EXCHANGE > 0) {
      return generateMatches(
        familyTree,
        typeGiver,
        typeReceiver,
        exchangeDataFromPreviousYear,
        0
      );
    }

    return [];
  }
  const exchanges = [];

  let possibleRecipients = shuffleArray(
    getAllParticipatingPeopleInTree(familyTree, typeReceiver)
  );
  let possibleGivers = shuffleArray(
    getAllParticipatingPeopleInTree(familyTree, typeGiver)
  );
  let possibleRecipientsForThisGiver = possibleRecipients.slice(0);
  let currentGiver = possibleGivers[0];
  try {
    while (possibleGivers.length > 0 && possibleRecipientsForThisGiver.length > 0) {
      possibleRecipientsForThisGiver.forEach((possibleRecipient, index) => {

        if (possibleRecipient === currentGiver) {
          if (possibleRecipientsForThisGiver.length > 1) {
            return;
          }
          throw new Error("Invalid combination");
        }
        const distance = socialDistance(
          familyTree,
          currentGiver,
          possibleRecipient
        );
        const personWhoIsBuyingForGiver = getExchangeForReceiver(
          exchanges,
          currentGiver
        );
        const recursiveGiving =
          personWhoIsBuyingForGiver &&
          personWhoIsBuyingForGiver.giver === possibleRecipient;
        const exchangeFromLastYear = getExchangeForGiver(
          exchangeDataFromPreviousYear,
          currentGiver
        );
        const boughtForSamePersonLastYear =
          exchangeFromLastYear &&
          areNamesSimilar(exchangeFromLastYear.receiver, possibleRecipient);

        if (
          distance > MIN_DISTANCE_THRESHOLD_FOR_EXCHANGE &&
          !recursiveGiving &&
          !boughtForSamePersonLastYear
        ) {
          exchanges.push({
            giver: currentGiver,
            receiver: possibleRecipient,
            socialDistance: distance,
            exchangeFromLastYear
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
          const indexOfReceiver = possibleRecipientsForThisGiver.indexOf(
            possibleRecipient
          );
          possibleRecipientsForThisGiver.splice(indexOfReceiver, 1);
        }
      });

      if (!possibleRecipientsForThisGiver.length && possibleRecipients.length) {
        throw new Error("Bad result. Try again");
      }
    }

    if (possibleGivers.length > 0 && possibleRecipients.length === 0) {
      possibleGivers.forEach((giver) => {
        exchanges.push({
          giver,
          receiver: NO_RECIPIENT,
          socialDistance: -1
        });
      });
    }
  } catch (e) {
    // invalid combination - start again
    return generateMatches(
      familyTree,
      typeGiver,
      typeReceiver,
      exchangeDataFromPreviousYear,
      attempts + 1
    );
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
  isParentOf,
  compileTree,
  addChildToNode,
  findNode,
  findNodeByID,
  removeNode
};

if (typeof module !== "undefined") {
  module.exports = facade;
} else {
  window.algo = facade;
}
