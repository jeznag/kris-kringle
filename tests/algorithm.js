const algo = require('../src/algorithm');

const testData = {
  type: 'root',
  name: 'root',
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

// TODO use a proper assertion library
function runTests() {
  const testTree = algo.compileTree(testData);

  const treeDepth = algo.treeDepth(testTree);

  const sharedParent = (algo.hasSharedParent(testTree, 'Alice Nagel', 'Jeremy Nagel'));
  const sharedParent2 = (algo.hasSharedParent(testTree, 'Fake Kid', 'Jeremy Nagel'));
  console.log('Shared parent working?', sharedParent, sharedParent2);

  const isParent = (algo.isParentOf(testTree, 'Judy McGannon', 'Jeremy Nagel'));
  const isParent2 = (algo.isParentOf(testTree, 'Tim Fleming', 'Ruby Fleming'));
  console.log('isParent working', isParent, isParent2);

  const judyDepth = algo.getDepthOfPerson(testTree, 'Judy McGannon', 1);
  const williamDepth = algo.getDepthOfPerson(testTree, 'William Fleming', 1);

  if (judyDepth !== 1 && williamDepth !== 2) {
    console.log('INVALID DEPTHS', judyDepth, williamDepth);
  }

  if (treeDepth !== 32) {
    console.log('Tree depth FAIL!!!', treeDepth);
  }

  const distanceTestCases = [
    {
      person1: 'Ruby Fleming',
      person2: 'William Fleming',
      expectedDistance: 0
    },
    {
      person1: 'Ruby Fleming',
      person2: 'Tim Fleming',
      expectedDistance: 1
    },
    {
      person1: 'Ruby Fleming',
      person2: 'Jane Fleming',
      expectedDistance: 1
    },
    {
      person1: 'Ruby Fleming',
      person2: 'Alice Nagel',
      expectedDistance: 4
    },
    {
      person1: 'William Fleming',
      person2: 'Judy McGannon',
      expectedDistance: 9
    },
    {
      person1: 'Sandy Xu',
      person2: 'Judy McGannon',
      expectedDistance: 1
    },
    {
      person1: 'Jeremy Nagel',
      person2: 'Judy McGannon',
      expectedDistance: 1
    },
    {
      person1: 'Jeremy Nagel',
      person2: 'Sandy Xu',
      expectedDistance: 0
    },
  ];

  distanceTestCases.forEach((testCase) => {
    const socialDistance = algo.socialDistance(testTree, testCase.person1, testCase.person2);
    if (socialDistance !== testCase.expectedDistance) {
      console.log('social distance fail!', testCase, socialDistance);
    }
  });

  const result = algo.run(testTree, 'young adult', 'young adult', exchangeDataFromLastYearYoungAdults);
  console.log('young adults', result);
  console.log('no recursive giving?', checkNoRecursiveGiving(result));
  console.log('no repeat giving?', checkNoRepeatGiving(result, exchangeDataFromLastYearYoungAdults));

  const EXPECTED_NUM_GIFT_EXCHANGES = 14;
  if (result.length !== EXPECTED_NUM_GIFT_EXCHANGES) {
    console.log('FAIL!!! Not enough exchanges', result.length);
  }

  const williamExchange = result.find((exchange) => exchange.giver === 'William Fleming');

  if (!williamExchange || williamExchange.receiver.includes('Fleming')) {
    console.log('FAIL!!! No giving in the same family');
  }

  const resultForKids = algo.run(testTree, 'old guard', 'kid', exchangeDataFromLastYearKids);
  console.log('KIDS!!!', resultForKids);
  console.log('no repeat giving?', checkNoRepeatGiving(resultForKids, exchangeDataFromLastYearKids));

  const resultForAdults = algo.run(testTree, 'old guard', 'old guard', exchangeDataFromLastYearAdults);
  console.log('ADULTS', resultForAdults);
  console.log('no recursive giving?', checkNoRecursiveGiving(resultForAdults));
  console.log('no repeat giving?', checkNoRepeatGiving(resultForAdults, exchangeDataFromLastYearAdults));
}

const testRecursive = [ { giver: 'Judy McGannon', receiver: 'Jane Fleming' },
  { giver: 'Dan McGannon', receiver: 'Emily Maher' },
  { giver: 'Maryanne McGannon', receiver: 'Judy McGannon' },
  { giver: 'Jane Fleming', receiver: 'Judy McGannon' },
  { giver: 'Emily Maher', receiver: 'Maryanne McGannon' },
  { giver: 'Peter Nagel', receiver: 'Tim Fleming' },
  { giver: 'Anne Rosamillia', receiver: 'Peter Maher' },
  { giver: 'Dan', receiver: 'Peter Nagel' },
  { giver: 'Tim Fleming', receiver: 'Anne Rosamillia' },
  { giver: 'Peter Maher', receiver: 'Dan' } ];

function checkNoRepeatGiving(thisYearExchanges, lastYearExchanges) {
  return thisYearExchanges.every((exchange) => {
    const hasRepeatGiving = lastYearExchanges.find((exchangeToCheck) => JSON.stringify(exchange) === JSON.stringify(exchangeToCheck));
    if (hasRepeatGiving) {
      console.log('REPEAT!!', exchange, hasRepeatGiving);
    }
    return !hasRepeatGiving;
  });
}

function checkNoRecursiveGiving(exchanges) {
  return exchanges.every((exchange) => {
    const hasRecursiveGiving = exchanges.find((exchangeToCheck) => exchangeToCheck.giver === exchange.receiver && exchangeToCheck.receiver === exchange.giver);
    return !hasRecursiveGiving;
  });
}

runTests();
