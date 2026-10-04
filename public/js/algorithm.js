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

/* ---------- Family graph & social distance ---------- */

// Stands in for the unrecorded ancestors shared by everyone at the top of the tree,
// which makes top-level people siblings of each other.
const FAMILY_ROOT = "__family_root__";

// Each edge reads "<relative> is my <relation>".
const RELATIONS = { PARENT: "parent", CHILD: "child", PARTNER: "partner" };
const INVERSE_RELATIONS = {
  [RELATIONS.PARENT]: RELATIONS.CHILD,
  [RELATIONS.CHILD]: RELATIONS.PARENT,
  [RELATIONS.PARTNER]: RELATIONS.PARTNER
};

function addRelation(graph, person, relative, relation) {
  if (!graph.has(person)) {
    graph.set(person, []);
  }
  graph.get(person).push({ person: relative, relation });
}

function connect(graph, person, relative, relation) {
  addRelation(graph, person, relative, relation);
  addRelation(graph, relative, person, INVERSE_RELATIONS[relation]);
}

/**
 * People are vertices. Partners are one step apart, and a child is one step from both
 * partners of their parent node, so in-laws are reached through the person they married.
 */
function buildFamilyGraph(tree) {
  const graph = new Map([[FAMILY_ROOT, []]]);
  const visit = (node, parents) => {
    if (node.name) {
      parents.forEach(parent => connect(graph, node.name, parent, RELATIONS.PARENT));
      if (node.partner) {
        connect(graph, node.name, node.partner, RELATIONS.PARTNER);
      }
    }
    const peopleInNode = [node.name, node.partner].filter(Boolean);
    (node.children || []).forEach(child => visit(child, peopleInNode));
  };
  tree.children.forEach(child => visit(child, [FAMILY_ROOT]));
  return graph;
}

/** Breadth-first shortest path: [{ person, relation }], where relation links it to the previous step. */
function findConnectionPath(graph, from, to) {
  if (!graph.has(from) || !graph.has(to)) {
    return null;
  }
  const cameFrom = new Map([[from, null]]);
  const queue = [from];
  while (queue.length && !cameFrom.has(to)) {
    const person = queue.shift();
    graph.get(person).forEach(({ person: relative, relation }) => {
      if (!cameFrom.has(relative)) {
        cameFrom.set(relative, { person, relation });
        queue.push(relative);
      }
    });
  }
  if (!cameFrom.has(to)) {
    return null;
  }
  const path = [];
  for (let person = to; person !== from; person = cameFrom.get(person).person) {
    path.unshift({ person, relation: cameFrom.get(person).relation });
  }
  path.unshift({ person: from, relation: null });
  return path;
}

const COUSIN_ORDINALS = ["first", "second", "third", "fourth", "fifth"];
const COUSIN_REMOVALS = ["once", "twice", "three times", "four times"];

function greatPrefix(count) {
  return "great-".repeat(Math.max(0, count));
}

function describeBloodRelationship(ups, downs) {
  if (ups === 0 && downs === 0) return null;
  if (downs === 0) return ups === 1 ? "parent" : `${greatPrefix(ups - 2)}grandparent`;
  if (ups === 0) return downs === 1 ? "child" : `${greatPrefix(downs - 2)}grandchild`;
  if (ups === 1 && downs === 1) return "sibling";
  if (downs === 1) return `${greatPrefix(ups - 2)}aunt or uncle`;
  if (ups === 1) return `${greatPrefix(downs - 2)}niece or nephew`;

  const degree = Math.min(ups, downs) - 1;
  const removed = Math.abs(ups - downs);
  const cousin = `${COUSIN_ORDINALS[degree - 1] || `${degree}th`} cousin`;
  return removed ? `${cousin} ${COUSIN_REMOVALS[removed - 1] || `${removed} times`} removed` : cousin;
}

/** Names what the last person in the path is to the first, e.g. "first cousin's partner". */
function describeRelationship(path) {
  const relations = path.slice(1).map(step => step.relation);
  const startsWithPartner = relations[0] === RELATIONS.PARTNER;
  const endsWithPartner = relations.length > 1 && relations[relations.length - 1] === RELATIONS.PARTNER;
  const bloodRelations = relations.slice(startsWithPartner ? 1 : 0, endsWithPartner ? -1 : undefined);
  const ups = bloodRelations.filter(relation => relation === RELATIONS.PARENT).length;
  const downs = bloodRelations.filter(relation => relation === RELATIONS.CHILD).length;

  // Blood relatives are reached by climbing to a common ancestor then descending; any other
  // shape (e.g. a partner mid-way) has no everyday name.
  const isClimbThenDescend = bloodRelations.every((relation, index) =>
    relation === (index < ups ? RELATIONS.PARENT : RELATIONS.CHILD)
  );
  if (!isClimbThenDescend) {
    return null;
  }
  const parts = [
    startsWithPartner && RELATIONS.PARTNER,
    describeBloodRelationship(ups, downs),
    endsWithPartner && RELATIONS.PARTNER
  ].filter(Boolean);
  return parts.length ? parts.join("'s ") : null;
}

/** How two people are related, for showing to humans. Always reflects the tree as it is now. */
function getConnection(tree, from, to) {
  const steps = findConnectionPath(buildFamilyGraph(tree), from, to);
  if (!steps) {
    return null;
  }
  return { steps, distance: steps.length - 1, relationship: describeRelationship(steps) };
}

// Caches are per tree object; run() clears its tree's entry so edits made in the page are seen.
const familyGraphCache = new WeakMap();

function getFamilyGraphCache(tree) {
  if (!familyGraphCache.has(tree)) {
    familyGraphCache.set(tree, { graph: buildFamilyGraph(tree), distances: new Map() });
  }
  return familyGraphCache.get(tree);
}

/** Number of family steps between two people (see buildFamilyGraph); Infinity if unconnected. */
function getSocialDistance(tree, person1, person2) {
  if (person1 === NO_RECIPIENT || person2 === NO_RECIPIENT) {
    return 0;
  }
  const { graph, distances } = getFamilyGraphCache(tree);
  const key = [person1, person2].sort().join("|");
  if (!distances.has(key)) {
    const path = findConnectionPath(graph, person1, person2);
    distances.set(key, path ? path.length - 1 : Infinity);
  }
  return distances.get(key);
}

function getExchangeForGiver(exchanges, giverName) {
  return exchanges.find(exchange => areNamesSimilar(exchange.giver, giverName));
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

function shuffleArray(arr) {
  const shuffledArray = arr.slice(0);
  return shuffledArray.sort((a, b) => (Math.random() > 0.5 ? -1 : 1));
}

// List of honorifics and descriptors to remove
const honorifics = ["Sage", "Esteemed", "Wise One", "Dr", "Padawan", "Fleetfoot", "Long Bready Hair", 'Seneschal', 'Scholar', 'Merchant', "Bloodletter", "Healer", "Low Physician", "Sentinel", "Warden", "Castellan",
  "Emissary", "Greenhand", "Life Bringer", "Herald", "Custodian", "Gearsmith",
  "Vizier", "Knight", "Physician", "Charioteer", "Iron Warrior", "Field Defender",
  "Swift Healer of the Realm", "Seer", "Counsel", "Scholar", "Visionary", "Paladin",
  "Cartographer", "Shieldbearer", "Princess", "Merchant", "Scientist", "Princess", 'Padawan', 'Groundling', 'Peasantling', "Alchemist", 'Fleetfoot', 'Neonate', 'Junior Striker'];

// Multi-word honorifics must be stripped before the single words inside them
// (e.g. "Swift Healer of the Realm" before "Healer"), or the leftovers break name matching.
const honorificsLongestFirst = [...honorifics].sort((a, b) => b.length - a.length);

const cleanedNameCache = {};

function cleanName(name) {
  if (cleanedNameCache[name]) {
    return cleanedNameCache[name];
  }
  
  let cleanedName = name;
  honorificsLongestFirst.forEach(honorific => {
    const regex = new RegExp(`\\b${honorific}\\b`, 'gi');
    cleanedName = cleanedName.replace(regex, '').trim();
  });
  cleanedName = cleanedName.replace(/\s+/g, ' ');
  cleanedNameCache[name] = cleanedName;
  return cleanedName;
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

const SIMILARITY_THRESHOLD = 0.25;

function relativeDistance(a, b) {
  const d = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length) || 1;
  return d / maxLen; // 0..1 (lower = closer)
}

const nameSimilarityCache = {};

// Function to check if two names are similar based on a threshold
function areNamesSimilar(name1, name2) {
  const cacheKey = [name1, name2].sort().join('|');
  if (nameSimilarityCache[cacheKey] !== undefined) {
    return nameSimilarityCache[cacheKey];
  }

  const result = _areNamesSimilar(name1, name2);
  nameSimilarityCache[cacheKey] = result;
  return result;
}

function _areNamesSimilar(name1, name2) {
  if (name1.includes('Patrick') && name2.includes('Patrick')) {
    // debugger;
  }
  const NAME_CHANGES_HARD_TO_FIND = [
    { oldName: 'Sist', newName: 'Tilly' },
    { oldName: 'Seneschal Krste Sekulovski', newName: 'Cartographer' },
    { oldName: ' Ash', newName: ' Ash' }
  ]

  const specialCaseResult = NAME_CHANGES_HARD_TO_FIND.find((nameData) => {
    return (name1.includes(nameData.oldName) && name2.includes(nameData.newName)) ||
      (name2.includes(nameData.oldName) && name1.includes(nameData.newName));
  })
  if (specialCaseResult) {
    console.log('Special case match for', name1, name2);
    return true;
  }

  const cleanedName1 = cleanName(name1);
  const cleanedName2 = cleanName(name2);
  const distance = relativeDistance(cleanedName1, cleanedName2);

  if (distance <= SIMILARITY_THRESHOLD && name1 !== name2) {
    console.log(`Names "${name1}" and "${name2}", (${cleanedName1}, ${cleanedName2}) are similar (distance: ${distance})`);
  }
  return distance <= SIMILARITY_THRESHOLD; // Adjust threshold as needed
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
      // console.debug('No last year match found for', exchange.giver);
    }

    const duplicateExchangesThisYear = thisYearExchanges.filter(
        exchangeToCheck => {
          if (areNamesSimilar(exchangeToCheck.giver, exchange.giver) && JSON.stringify(exchangeToCheck) !== JSON.stringify(exchange)) {
            console.log('Found duplicate this year for', exchange.giver, exchangeToCheck, exchange);
            return true;
          }
        }
    );

    const hasRepeatGivingThisYear = duplicateExchangesThisYear
      .length > 1;

    const gaveToSamePersonLastYear = lastYearExchanges.find(
      exchangeToCheck => {
        if (exchangeToCheck.receiver === NO_RECIPIENT && exchange.receiver === NO_RECIPIENT) {
          return false;
        }

        return (
          areNamesSimilar(exchange.giver, exchangeToCheck.giver) &&
          areNamesSimilar(exchange.receiver, exchangeToCheck.receiver)
        );
      }
    );

    if (hasRepeatGivingThisYear || gaveToSamePersonLastYear) {
      console.log('Invalid: gavetolastpersn?', gaveToSamePersonLastYear, 'hasRepeatGivingThisYear', hasRepeatGivingThisYear, JSON.stringify(duplicateExchangesThisYear))
    }

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

const MAX_ITERATIONS = 100;
const MAX_DURATION_MS = 90000;
// A match must be strictly further apart (in family steps) than this. generateMatches relaxes
// it a step at a time when no draw fits: e.g. 3 for young adults means cousins (4) first.
const STARTING_MIN_DISTANCE = { "kid": 3, "young adult": 3, "old guard": 2 };
// Distance 1 is a partner, parent or child: never acceptable, however stuck the draw is.
const LOWEST_MIN_DISTANCE = 1;
// Attempts are cheap (well under a millisecond); too few and tight families (e.g. old guard,
// where only in-laws are further than siblings) get relaxed to siblings unnecessarily.
const ATTEMPTS_PER_MIN_DISTANCE = 300;
// Old guard are too closely related to also require variety from last year, and kids are few.
const RECEIVER_TYPES_NEEDING_VARIETY = ["young adult"];
// How much closer than the giver threshold this year's receiver may be to last year's.
const LAST_RECIPIENT_DISTANCE_SLACK = 2;
// Big enough that any draw that avoids someone sitting out two years running beats any that doesn't.
const REPEATED_YEAR_OFF_PENALTY = 1000;

function hadYearOffLastYear(giver, exchangeDataFromPreviousYear) {
  return getExchangeDataForGiver(giver, exchangeDataFromPreviousYear)?.receiver === NO_RECIPIENT;
}

function scoreDraw(exchanges, exchangeDataFromPreviousYear) {
  // An unconnected person (Infinity) shouldn't make a draw look infinitely good.
  const totalDistance = exchanges.reduce(
    (total, exchange) => total + (Number.isFinite(exchange.socialDistance) ? exchange.socialDistance : 0),
    0
  );
  const repeatedYearOffs = exchanges.filter(exchange =>
    exchange.receiver === NO_RECIPIENT && hadYearOffLastYear(exchange.giver, exchangeDataFromPreviousYear)
  ).length;
  return totalDistance - REPEATED_YEAR_OFF_PENALTY * repeatedYearOffs;
}

function isCompleteDraw(exchanges, givers, recipients) {
  const giversInDraw = exchanges.map(exchange => exchange.giver);
  const recipientsInDraw = exchanges.map(exchange => exchange.receiver);
  return !arrayDiff(givers, giversInDraw).length && !arrayDiff(recipients, recipientsInDraw).length;
}

/**
 * Draws matches many times and keeps the best: the most family distance overall, while
 * avoiding anyone having a year off two years running. Every kept draw is double-checked
 * for repeat and recursive giving.
 */
function run(familyTree, typeGiver, typeReceiver, exchangeDataFromPreviousYear) {
  familyGraphCache.delete(familyTree);
  const startTime = Date.now();
  const givers = getAllParticipatingPeopleInTree(familyTree, typeGiver);
  const recipients = getAllParticipatingPeopleInTree(familyTree, typeReceiver);
  if (recipients.length === 0) {
    return { result: [], iterations: 0, executionTime: 0 };
  }

  let best = null;
  let iterations = 0;
  while (iterations < MAX_ITERATIONS && Date.now() - startTime < MAX_DURATION_MS) {
    iterations++;
    const exchanges = generateMatches(familyTree, typeGiver, typeReceiver, exchangeDataFromPreviousYear);
    const isValidDraw = isCompleteDraw(exchanges, givers, recipients) &&
      checkNoRepeatGiving(exchanges, exchangeDataFromPreviousYear) &&
      checkNoRecursiveGiving(exchanges);
    if (!isValidDraw) {
      continue;
    }
    const score = scoreDraw(exchanges, exchangeDataFromPreviousYear);
    if (!best || score > best.score) {
      best = { score, exchanges };
    }
  }

  return { result: best ? best.exchanges : [], iterations, executionTime: Date.now() - startTime };
}

// Keyed by the previous year's exchange list, so different histories never share answers.
const lastYearExchangeCache = new WeakMap();

function getExchangeDataForGiver(giverName, exchangeDataFromPreviousYear) {
  if (!lastYearExchangeCache.has(exchangeDataFromPreviousYear)) {
    lastYearExchangeCache.set(exchangeDataFromPreviousYear, new Map());
  }
  const exchangesByGiver = lastYearExchangeCache.get(exchangeDataFromPreviousYear);
  if (!exchangesByGiver.has(giverName)) {
    const exchangeFromLastYear = getExchangeForGiver(exchangeDataFromPreviousYear, giverName);
    const lastYearExchangeCorrected = exchangeFromLastYear?.receiver?.includes('Sist') ? {
      ...exchangeFromLastYear,
      receiver: 'Princess Tilly'
    } : exchangeFromLastYear;
    exchangesByGiver.set(giverName, lastYearExchangeCorrected);
  }
  return exchangesByGiver.get(giverName);
}

function isAcceptableMatch(giver, candidate, draw) {
  const { familyTree, typeReceiver, exchangeDataFromPreviousYear, exchanges, allRecipients, minDistance } = draw;
  if (candidate === giver || getSocialDistance(familyTree, giver, candidate) <= minDistance) {
    return false;
  }
  const isReciprocal = exchanges.some(exchange => exchange.giver === candidate && exchange.receiver === giver);
  if (isReciprocal) {
    return false;
  }

  const exchangeFromLastYear = getExchangeDataForGiver(giver, exchangeDataFromPreviousYear);
  if (!exchangeFromLastYear) {
    return true;
  }
  if (areNamesSimilar(exchangeFromLastYear.receiver, candidate)) {
    return false;
  }
  if (!RECEIVER_TYPES_NEEDING_VARIETY.includes(typeReceiver)) {
    return true;
  }
  // Steer away from last year's recipient's corner of the family too.
  const lastRecipient = allRecipients.find(recipient => areNamesSimilar(recipient, exchangeFromLastYear.receiver));
  return !lastRecipient ||
    getSocialDistance(familyTree, lastRecipient, candidate) > minDistance - LAST_RECIPIENT_DISTANCE_SLACK;
}

// Givers who sat out last year choose first, so they get a recipient before they run out.
function prioritiseLastYearsYearOffs(givers, exchangeDataFromPreviousYear) {
  const hadYearOff = givers.filter(giver => hadYearOffLastYear(giver, exchangeDataFromPreviousYear));
  return [...hadYearOff, ...givers.filter(giver => !hadYearOff.includes(giver))];
}

/** One random attempt at a full draw, or null if some giver ends up with nobody acceptable. */
function attemptDraw(familyTree, typeGiver, typeReceiver, exchangeDataFromPreviousYear, minDistance) {
  const allRecipients = getAllParticipatingPeopleInTree(familyTree, typeReceiver);
  let remainingRecipients = shuffleArray(allRecipients);
  const exchanges = [];
  const draw = { familyTree, typeReceiver, exchangeDataFromPreviousYear, exchanges, allRecipients, minDistance };

  const givers = prioritiseLastYearsYearOffs(
    shuffleArray(getAllParticipatingPeopleInTree(familyTree, typeGiver)),
    exchangeDataFromPreviousYear
  );
  for (const giver of givers) {
    const exchangeFromLastYear = getExchangeDataForGiver(giver, exchangeDataFromPreviousYear);
    if (!remainingRecipients.length) {
      exchanges.push({ giver, receiver: NO_RECIPIENT, socialDistance: 0, exchangeFromLastYear, giver_id: findNode(familyTree, giver).ID });
      continue;
    }
    const receiver = remainingRecipients.find(candidate => isAcceptableMatch(giver, candidate, draw));
    if (!receiver) {
      return null;
    }
    exchanges.push({
      giver,
      receiver,
      socialDistance: getSocialDistance(familyTree, giver, receiver),
      exchangeFromLastYear,
      giver_id: findNode(familyTree, giver).ID,
      receiver_id: findNode(familyTree, receiver).ID
    });
    remainingRecipients = remainingRecipients.filter(recipient => recipient !== receiver);
  }
  return exchanges;
}

/**
 * Generates possible kris kringle matches adhering to the following business rules:
 * 1. Kids shouldn't buy for parents, partners shouldn't buy for each other
 * 2. People shouldn't buy for the same person they bought for the previous year
 * 3. No recursive gift giving allowed
 * 4. Financial situation should be respected so that young adults don't have to buy too many gifts
 * 5. Any left over people should be assigned to a leftover pool
 * Starts strict about family distance and relaxes it until a draw fits.
 * @return {Array<{giver: string, receiver: string}>}  Best guess at matches, or [] if none fit
 */
function generateMatches(familyTree, typeGiver, typeReceiver, exchangeDataFromPreviousYear) {
  for (let minDistance = STARTING_MIN_DISTANCE[typeReceiver]; minDistance >= LOWEST_MIN_DISTANCE; minDistance--) {
    for (let attempt = 0; attempt < ATTEMPTS_PER_MIN_DISTANCE; attempt++) {
      const exchanges = attemptDraw(familyTree, typeGiver, typeReceiver, exchangeDataFromPreviousYear, minDistance);
      if (exchanges) {
        return exchanges;
      }
    }
  }
  return [];
}

const facade = {
  NO_RECIPIENT,
  FAMILY_ROOT,
  run,
  getSocialDistance,
  getConnection,
  cleanName,
  areNamesSimilar,
  compileTree,
  addChildToNode,
  findNode,
  findNodeByID,
  removeNode,
  getExchangeDataForGiver
};

if (typeof module !== "undefined") {
  module.exports = facade;
} else {
  window.algo = facade;
}
