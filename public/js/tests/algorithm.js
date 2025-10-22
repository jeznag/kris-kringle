const algo = require("../algorithm");

const testData = [
  {
    id: 1,
    name: "Jeremy Nagel",
    partner: "Sandy Xu",
    family_member_type: "young adult",
    parent_id: 2,
    participating_this_year: 'true',
  },
  {
    id: 2,
    name: "Judy McGannon",
    partner: "Peter Nagel",
    family_member_type: "old guard",
    parent_id: null,
    participating_this_year: 'true',
  },
  {
    id: 3,
    name: "Alice Nagel",
    partner: "",
    family_member_type: "young adult",
    parent_id: 2,
    participating_this_year: false,
  },
  {
    id: 4,
    name: "Matthew Nagel",
    partner: "Karen",
    family_member_type: "young adult",
    parent_id: 2,
    participating_this_year: 'true',
  },
  {
    id: 5,
    name: "Jane Fleming",
    partner: "Tim Fleming",
    family_member_type: "old guard",
    parent_id: null,
    participating_this_year: 'true',
  },
  {
    id: 6,
    name: "William Fleming",
    partner: "Will's GF",
    family_member_type: "young adult",
    parent_id: 5,
    participating_this_year: 'true',
  },
  {
    id: 7,
    name: "Ruby Fleming",
    partner: "Ruby's BF",
    family_member_type: "young adult",
    parent_id: 5,
    participating_this_year: 'true',
  },
  {
    id: 8,
    name: "Henry Fleming",
    partner: "",
    family_member_type: "kid",
    parent_id: 5,
    participating_this_year: 'true',
  },
  {
    id: 9,
    name: "George Fleming",
    partner: "",
    family_member_type: "kid",
    parent_id: 5,
    participating_this_year: 'true',
  },
  {
    id: 10,
    name: "Fred Fleming",
    partner: "",
    family_member_type: "kid",
    parent_id: 5,
    participating_this_year: 'true',
  },
  {
    id: 11,
    name: "Xavier Fleming",
    partner: "",
    family_member_type: "kid",
    parent_id: 5,
    participating_this_year: 'true',
  },
  {
    id: 12,
    name: "Maryanne McGannon",
    partner: "Dan",
    family_member_type: "old guard",
    parent_id: null,
    participating_this_year: 'true',
  },
  {
    id: 13,
    name: "Dan McGannon",
    partner: "Anne Rosamilia",
    family_member_type: "old guard",
    parent_id: null,
    participating_this_year: 'true',
  },
  {
    id: 14,
    name: "Claire McGannon",
    partner: "Ash",
    family_member_type: "young adult",
    parent_id: 13,
    participating_this_year: 'true',
  },
  {
    id: 15,
    name: "Elena McGannon",
    partner: "Matt (Elena BF)",
    family_member_type: "young adult",
    parent_id: 13,
    participating_this_year: 'true',
  },
  {
    id: 16,
    name: "Francesca McGannon",
    partner: "",
    family_member_type: "young adult",
    parent_id: 13,
    participating_this_year: 'true',
  },
  {
    id: 17,
    name: "James McGannon",
    partner: "",
    family_member_type: "kid",
    parent_id: 13,
    participating_this_year: 'true',
  },
  {
    id: 18,
    name: "Emily Maher",
    partner: "Peter Maher",
    family_member_type: "old guard",
    parent_id: null,
    participating_this_year: 'true',
  },
  {
    id: 19,
    name: "Patrick Maher",
    partner: "",
    family_member_type: "kid",
    parent_id: 18,
    participating_this_year: 'true',
  },
  {
    id: 20,
    name: "Oliver Maher",
    partner: "",
    family_member_type: "kid",
    parent_id: 18,
    participating_this_year: 'true',
  },
  {
    id: 21,
    name: "Fake Kid",
    partner: "",
    family_member_type: "kid",
    parent_id: 1,
    participating_this_year: 'true',
  }
];

const exchangeDataFromLastYearYoungAdults = [
  { giver: "Jeremy Nagel", receiver: "William Fleming"},
  { giver: "Ruby Fleming", receiver: "Claire McGannon" },
  { giver: "Elena McGannon", receiver: "Jeremy Nagel" },
  { giver: "Alice Nagel", receiver: "Will GF" },
  { giver: "Jack Someone", receiver: "Ash" },
  { giver: "Matt (Elena BF)", receiver: "Sandy Xu" },
  { giver: "Matt Nagel", receiver: "Ruby Fleming" },
  { giver: "Claire McGannon", receiver: "Alice Nagel" },
  { giver: "Karen", receiver: "Jack Someone" },
  { giver: "Ash", receiver: "Matt Nagel" },
  { giver: "William Fleming", receiver: "Elena McGannon" },
  { giver: "Francisca McGannon", receiver: "Karen" },
  { giver: "Will GF", receiver: "Matt (Elena BF)" },
  { giver: "Sandy Xu", receiver: "Francisca McGannon" }
];

const exchangeDataFromLastYearAdults = [
  { giver: "Judy McGannon", receiver: "Jane Fleming" },
  { giver: "Dan McGannon", receiver: "Emily Maher" },
  { giver: "Maryanne McGannon", receiver: "Judy McGannon" },
  { giver: "Jane Fleming", receiver: "Dan McGannon" },
  { giver: "Emily Maher", receiver: "Maryanne McGannon" },
  { giver: "Peter Nagel", receiver: "Tim Fleming" },
  { giver: "Anne Rosamillia", receiver: "Peter Maher" },
  { giver: "Dan", receiver: "Peter Nagel" },
  { giver: "Tim Fleming", receiver: "Anne Rosamillia" },
  { giver: "Peter Maher", receiver: "Dan" }
];

const exchangeDataFromLastYearKids = [
  { giver: "Judy McGannon", receiver: "George Fleming" },
  { giver: "Jane Fleming", receiver: "James McGannon" },
  { giver: "Dan McGannon", receiver: "Oliver Maher" },
  { giver: "Emily Maher", receiver: "Fake Kid" },
  { giver: "Peter Nagel", receiver: "Xavier Fleming" },
  { giver: "Tim Fleming", receiver: "Patrick Maher" },
  { giver: "Peter Maher", receiver: "Fred Fleming" },
  { giver: "Anne Rosamillia", receiver: "NO-ONE" },
  { giver: "Maryanne McGannon", receiver: "NO-ONE" },
  { giver: "Dan", receiver: "NO-ONE" }
];
const testTree = algo.compileTree(testData);

// TODO use a proper assertion library

function checkTreeDepth() {
  const treeDepth = algo.treeDepth(testTree);
  const judyDepth = algo.getDepthOfPerson(testTree, "Judy McGannon", 1);
  const williamDepth = algo.getDepthOfPerson(testTree, "William Fleming", 1);

  if (judyDepth !== 1 && williamDepth !== 2) {
    throw new Error("INVALID DEPTHS" + judyDepth + williamDepth);
  }

  if (treeDepth !== 33) {
    throw new Error("Tree depth FAIL!!!" + treeDepth);
  }
}

function checkHasSharedParent() {
  const sharedParent = algo.hasSharedParent(
    testTree,
    "Alice Nagel",
    "Jeremy Nagel"
  );
  const sharedParent2 = algo.hasSharedParent(
    testTree,
    "Fake Kid",
    "Jeremy Nagel"
  );
  if (!sharedParent || !sharedParent2) {
    throw new Error("FAIL: Shared parent should be true", sharedParent, sharedParent2);
  }
}

function checkIsParentOf() {
  const isParent = algo.isParentOf(testTree, "Judy McGannon", "Jeremy Nagel");
  const isParent2 = algo.isParentOf(testTree, "Tim Fleming", "Ruby Fleming");
  if (!isParent && isParent2) {
    throw new Error("FAIL - isParent should be true", isParent, isParent2);
  }
}

function checkDistanceCalculation() {
  const distanceTestCases = [
    {
      person1: "Ruby Fleming",
      person2: "William Fleming",
      expectedDistance: 2
    },
    {
      person1: "Ruby Fleming",
      person2: "Tim Fleming",
      expectedDistance: 2
    },
    {
      person1: "Ruby Fleming",
      person2: "Jane Fleming",
      expectedDistance: 2
    },
    {
      person1: "Ruby Fleming",
      person2: "Alice Nagel",
      expectedDistance: 12
    },
    {
      person1: "William Fleming",
      person2: "Judy McGannon",
      expectedDistance: 8
    },
    {
      person1: "Sandy Xu",
      person2: "Judy McGannon",
      expectedDistance: 5
    },
    {
      person1: "Jeremy Nagel",
      person2: "Judy McGannon",
      expectedDistance: 2
    },
    {
      person1: "Jeremy Nagel",
      person2: "Sandy Xu",
      expectedDistance: 0
    },
    {
      person1: "Jeremy Nagel",
      person2: "Alice Nagel",
      expectedDistance: 2
    },
    {
      person1: "Elena McGannon",
      person2: "Matt (Elena BF)",
      expectedDistance: 0
    },
    {
      person1: "Claire McGannon",
      person2: "Matt (Elena BF)",
      expectedDistance: 7
    },
    {
      person1: "Claire McGannon",
      person2: "Alice Nagel",
      expectedDistance: 19
    },
    {
      person1: "Matt (Elena BF)",
      person2: "Alice Nagel",
      expectedDistance: 24
    },
    {
      person1: "Judy McGannon",
      person2: "Peter Nagel",
      expectedDistance: 0
    },
    {
      person1: "Judy McGannon",
      person2: "Jane Fleming",
      expectedDistance: 2
    },
    {
      person1: "Tim Fleming",
      person2: "Jane Fleming",
      expectedDistance: 0
    }
  ];

  distanceTestCases.forEach(testCase => {
    const socialDistance = algo.getSocialDistance(
      testTree,
      testCase.person1,
      testCase.person2
    );
    if (socialDistance !== testCase.expectedDistance) {
      throw new Error("social distance fail!" + JSON.stringify(testCase) + 'Actual: ' + socialDistance);
    }
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

function getPeopleOfType(type, dataToCheck) {
  return (dataToCheck || testData).reduce((peopleList, personDatum) => {
    if (
      personDatum.name &&
      personDatum.participating_this_year === "true" &&
      personDatum.family_member_type === type
    ) {
      peopleList.push(personDatum.name);
    }
    if (
      personDatum.partner &&
      personDatum.participating_this_year === "true" &&
      personDatum.family_member_type === type
    ) {
      peopleList.push(personDatum.partner);
    }
    return peopleList;
  }, []);
}

function checkResultValid(
  testTree,
  giverType,
  receiverType,
  exchangeDataFromLastYear,
  dataToCheck
) {
  const result = algo.run(
    testTree,
    giverType,
    receiverType,
    exchangeDataFromLastYear
  );

  const expectedGivers = getPeopleOfType(giverType, dataToCheck);
  const expectedReceivers = getPeopleOfType(receiverType, dataToCheck);
  const actualGivers = result.result.map(exchange => exchange.giver);
  const actualReceivers = result.result.map(exchange => exchange.receiver);

  const missingReceivers = arrayDiff(expectedReceivers, actualReceivers);
  const extraReceivers = arrayDiff(actualReceivers, expectedReceivers);
  const missingGivers = arrayDiff(expectedGivers, actualGivers);
  const extraGivers = arrayDiff(actualGivers, expectedGivers);

  if (missingGivers.length) {
    throw new Error("FAIL - missing givers " + JSON.stringify(missingGivers) + ".\nActual givers: " + JSON.stringify(actualGivers));
  }
  if (missingReceivers.length) {
    throw new Error(
      "FAIL - missing receivers " + JSON.stringify(missingReceivers)
    );
  }

  if (extraGivers.length) {
    throw new Error("FAIL - extra givers " + JSON.stringify(extraGivers));
  }
  if (extraReceivers.length) {
    if (!extraReceivers.every(receiver => receiver === "NO-ONE")) {
      throw new Error(
        "FAIL - extra receivers " + JSON.stringify(extraReceivers)
      );
    }
  }
  const hasRecursiveGiving = checkHasRecursiveGiving(result.result);
  if (hasRecursiveGiving) {
    throw new Error("FAIL - has recursive giving " + hasRecursiveGiving);
  }
  const hasRepeatGiving = checkHasRepeatGiving(
    result.result,
    exchangeDataFromLastYear
  );
  if (hasRepeatGiving) {
    throw new Error("Has repeat giving" + JSON.stringify(result));
  }
}

function checkHasRepeatGiving(thisYearExchanges, lastYearExchanges) {
  return thisYearExchanges.every(exchange => {
    const hasRepeatGiving = lastYearExchanges.find(
      exchangeToCheck =>
        JSON.stringify(exchange) === JSON.stringify(exchangeToCheck)
    );
    if (hasRepeatGiving) {
      console.log("REPEAT!!", exchange, hasRepeatGiving);
    }
    return hasRepeatGiving;
  });
}

function checkHasRecursiveGiving(exchanges) {
  return exchanges.every(exchange => {
    const hasRecursiveGiving = exchanges.find(
      exchangeToCheck =>
        exchangeToCheck.giver === exchange.receiver &&
        exchangeToCheck.receiver === exchange.giver
    );
    if (hasRecursiveGiving) {
      console.log("RECURSIVE!!", exchange, hasRecursiveGiving);
    }
    return hasRecursiveGiving;
  });
}

const oldGuardData = [
  {
    id: 21,
    name: "Elaine",
    partner: "",
    family_member_type: "old guard",
    parent_id: "root",
    participating_this_year: "true"
  },
  {
    id: 25,
    name: "Peter",
    partner: "Judy",
    family_member_type: "old guard",
    parent_id: "21",
    participating_this_year: "true"
  },
  {
    id: 23,
    name: "Tricia",
    partner: "Denis",
    family_member_type: "old guard",
    parent_id: "21",
    participating_this_year: "true"
  },
  {
    id: 27,
    name: "Jess",
    partner: "",
    family_member_type: "old guard",
    parent_id: "23",
    participating_this_year: "true"
  },
  {
    id: 29,
    name: "Alice",
    partner: "",
    family_member_type: "old guard",
    parent_id: "25",
    participating_this_year: "true"
  },
  {
    id: 31,
    name: "Matt",
    partner: "Karen",
    family_member_type: "old guard",
    parent_id: "25",
    participating_this_year: "true"
  },
  {
    id: 32,
    name: "Jeremy",
    partner: "Sandy",
    family_member_type: "old guard",
    parent_id: "25",
    participating_this_year: "true"
  }
];

const testTree2 = algo.compileTree(oldGuardData);

function checkAllOldGuard() {
  checkResultValid(testTree2, "old guard", "old guard", [], oldGuardData);
}

function checkSocialDistance2() {
  const distanceTestCases = [
    { giver: "Matt", receiver: "Jess", socialDistance: 9 },
    { giver: "Alice", receiver: "Elaine", socialDistance: 2 },
    { giver: "Tricia", receiver: "Judy", socialDistance: 10 },
    { giver: "Jeremy", receiver: "Karen", socialDistance: 9 },
    { giver: "Denis", receiver: "Alice", socialDistance: 11 },
    { giver: "Jess", receiver: "Jeremy", socialDistance: 10 },
    { giver: "Judy", receiver: "Peter", socialDistance: 0 },
    { giver: "Karen", receiver: "Tricia", socialDistance: 12 },
    { giver: "Peter", receiver: "Denis", socialDistance: 10 },
    { giver: "Elaine", receiver: "Sandy", socialDistance: 8 },
    { giver: "Sandy", receiver: "Matt", socialDistance: 9 }
  ];

  distanceTestCases.forEach(testCase => {
    const socialDistance = algo.getSocialDistance(
      testTree2,
      testCase.giver,
      testCase.receiver
    );
    if (socialDistance !== testCase.socialDistance) {
      throw new Error(
        "social distance fail!" +
          JSON.stringify(testCase) +
          "Actual: " +
          socialDistance
      );
    }
  });
}

function runTests() {
  checkAllOldGuard();
  checkSocialDistance2();
  checkIsParentOf();
  checkTreeDepth();
  checkDistanceCalculation();
  checkResultValid(testTree, 'young adult', 'young adult', exchangeDataFromLastYearYoungAdults);
  checkResultValid(testTree, 'old guard', 'old guard', exchangeDataFromLastYearAdults);
  checkResultValid(testTree, 'old guard', 'kid', exchangeDataFromLastYearKids);

  console.log('All tests passed :)');
}

runTests();
