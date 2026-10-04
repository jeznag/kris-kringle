const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const algo = require('../public/js/algorithm.js');
const { FAMILY_MEMBERS } = require('./fixtures.js');

const OLD_GUARD = 'old guard';
const YOUNG_ADULT = 'young adult';
const KID = 'kid';
const PARTNER_OR_PARENT_DISTANCE = 1;
const SIBLING_DISTANCE = 2;
// Draws are random, so behavioural checks repeat a few times to catch flaky successes.
const REPEATED_DRAWS = 5;

let tree;

beforeEach(() => {
  tree = algo.compileTree(structuredClone(FAMILY_MEMBERS));
});

function participatingPeople(type) {
  return FAMILY_MEMBERS
    .filter((member) => member.family_member_type === type && member.participating_this_year === 'true')
    .flatMap((member) => [member.name, member.partner].filter(Boolean));
}

function realMatches(exchanges) {
  return exchanges.filter((exchange) => exchange.receiver !== algo.NO_RECIPIENT);
}

function toHistory(exchanges) {
  return exchanges.map(({ giver, receiver }) => ({ giver, receiver }));
}

describe('compileTree', () => {
  it('attaches children whatever order the rows arrive in', () => {
    const reversedTree = algo.compileTree(structuredClone(FAMILY_MEMBERS).reverse());
    assert.equal(algo.findNode(reversedTree, 'Sean').parent, '2');
    assert.deepEqual(
      algo.findNode(reversedTree, 'Judy McGannon').children.map((child) => child.name).sort(),
      ['Alice Nagel', 'Jeremy Nagel', 'Matthew Nagel'],
    );
  });

  it('treats a parent_id of "root" as top level', () => {
    const rootTree = algo.compileTree([
      { id: 1, name: 'Elaine', partner: '', family_member_type: OLD_GUARD, parent_id: 'root', participating_this_year: 'true' },
    ]);
    assert.equal(rootTree.children[0].name, 'Elaine');
  });
});

describe('getSocialDistance', () => {
  const cases = [
    ['partners', 'Jeremy Nagel', 'Sandy Xu', 1],
    ['parent and child', 'Judy McGannon', 'Jeremy Nagel', 1],
    ['a parent who married in', 'Peter Nagel', 'Jeremy Nagel', 1],
    ['siblings', 'Jeremy Nagel', 'Alice Nagel', 2],
    ['top-level siblings, via the family root', 'Judy McGannon', 'Jane Fleming', 2],
    ['grandparent and grandchild', 'Judy McGannon', 'Sean', 2],
    ['partner and their parent-in-law', 'Sandy Xu', 'Judy McGannon', 2],
    ['sibling and their sibling-in-law', 'Judy McGannon', 'Tim Fleming', 3],
    ['aunt and nephew', 'Jane Fleming', 'Jeremy Nagel', 3],
    ['first cousins', 'Jeremy Nagel', 'Ruby Fleming', 4],
    ['first cousin and their cousin’s partner', 'Alice Nagel', 'Ash', 5],
    ['partners of first cousins', 'Sandy Xu', 'Ash', 6],
  ];
  cases.forEach(([relationship, person1, person2, expected]) => {
    it(`is ${expected} for ${relationship}`, () => {
      assert.equal(algo.getSocialDistance(tree, person1, person2), expected);
      assert.equal(algo.getSocialDistance(tree, person2, person1), expected);
    });
  });

  it('is the same for every pair of first cousins, wherever they sit in the tree', () => {
    const cousinPairs = [
      ['Ruby Fleming', 'Alice Nagel'],
      ['Claire McGannon', 'Alice Nagel'],
      ['Elena McGannon', 'Matthew Nagel'],
      ['William Fleming', 'Claire McGannon'],
    ];
    const distances = cousinPairs.map(([cousin1, cousin2]) => algo.getSocialDistance(tree, cousin1, cousin2));
    assert.deepEqual(new Set(distances), new Set([4]));
  });

  it('is 0 for the same person and for a year off', () => {
    assert.equal(algo.getSocialDistance(tree, 'Jeremy Nagel', 'Jeremy Nagel'), 0);
    assert.equal(algo.getSocialDistance(tree, 'Jeremy Nagel', algo.NO_RECIPIENT), 0);
  });

  it('is Infinity for someone not in the tree', () => {
    assert.equal(algo.getSocialDistance(tree, 'Jeremy Nagel', 'A Stranger'), Infinity);
    assert.equal(algo.getSocialDistance(tree, 'Jeremy Nagel', undefined), Infinity);
  });
});

describe('getConnection', () => {
  it('walks up to the common ancestor and back down', () => {
    const connection = algo.getConnection(tree, 'Jeremy Nagel', 'Claire McGannon');
    assert.deepEqual(
      connection.steps.map((step) => step.person),
      ['Jeremy Nagel', 'Judy McGannon', algo.FAMILY_ROOT, 'Dan McGannon', 'Claire McGannon'],
    );
    assert.deepEqual(connection.steps.map((step) => step.relation), [null, 'parent', 'parent', 'child', 'child']);
    assert.equal(connection.distance, 4);
  });

  const relationships = [
    ['Jeremy Nagel', 'Sandy Xu', 'partner'],
    ['Jeremy Nagel', 'Judy McGannon', 'parent'],
    ['Judy McGannon', 'Jeremy Nagel', 'child'],
    ['Jeremy Nagel', 'Alice Nagel', 'sibling'],
    ['Sean', 'Judy McGannon', 'grandparent'],
    ['Judy McGannon', 'Sean', 'grandchild'],
    ['Jeremy Nagel', 'Jane Fleming', 'aunt or uncle'],
    ['Jane Fleming', 'Jeremy Nagel', 'niece or nephew'],
    ['Jane Fleming', 'Sean', 'great-niece or nephew'],
    ['Jeremy Nagel', 'Ruby Fleming', 'first cousin'],
    ['Ruby Fleming', 'Sean', 'first cousin once removed'],
    ['Sean', 'Elio', 'second cousin'],
    ['Sandy Xu', 'Judy McGannon', "partner's parent"],
    ['Alice Nagel', 'Ash', "first cousin's partner"],
    ['Sandy Xu', 'Ash', "partner's first cousin's partner"],
  ];
  relationships.forEach(([from, to, expected]) => {
    it(`describes ${to} as ${from}'s ${expected}`, () => {
      assert.equal(algo.getConnection(tree, from, to).relationship, expected);
    });
  });

  it('reflects edits to the tree immediately', () => {
    assert.equal(algo.getConnection(tree, 'Jeremy Nagel', 'Grace').distance, 5);
    algo.findNode(tree, 'Fred Fleming').partner = 'Grace Smith';
    assert.equal(algo.getConnection(tree, 'Jeremy Nagel', 'Grace'), null);
    assert.equal(algo.getConnection(tree, 'Jeremy Nagel', 'Grace Smith').distance, 5);
  });

  it('is null when either person is not in the tree', () => {
    assert.equal(algo.getConnection(tree, 'Jeremy Nagel', 'A Stranger'), null);
  });
});

describe('cleanName and areNamesSimilar', () => {
  it('strips multi-word honorifics before the words inside them', () => {
    assert.equal(algo.cleanName('Swift Healer of the Realm Ash'), 'Ash');
    assert.equal(algo.cleanName('Junior Striker Julijan'), 'Julijan');
  });

  it('matches a titled name to the same person without a title', () => {
    assert.ok(algo.areNamesSimilar('Herald Jeremy Nagel', 'Jeremy Nagel'));
    assert.ok(algo.areNamesSimilar('Swift Healer of the Realm Ash', 'Ash'));
    assert.ok(!algo.areNamesSimilar('Jeremy Nagel', 'Alice Nagel'));
  });
});

describe('run', () => {
  const categories = [
    [OLD_GUARD, KID],
    [YOUNG_ADULT, YOUNG_ADULT],
    [OLD_GUARD, OLD_GUARD],
  ];

  categories.forEach(([giverType, receiverType]) => {
    describe(`${giverType} → ${receiverType}`, () => {
      it('gives every participating giver exactly one match and every recipient exactly one gift', () => {
        const { result } = algo.run(tree, giverType, receiverType, []);
        const givers = result.map((exchange) => exchange.giver);
        const receivers = realMatches(result).map((exchange) => exchange.receiver);
        assert.deepEqual([...givers].sort(), participatingPeople(giverType).sort());
        assert.deepEqual([...receivers].sort(), participatingPeople(receiverType).sort());
      });

      it('never matches anyone with themselves, their partner, parent or child', () => {
        const { result } = algo.run(tree, giverType, receiverType, []);
        realMatches(result).forEach((exchange) => {
          assert.ok(
            algo.getSocialDistance(tree, exchange.giver, exchange.receiver) > PARTNER_OR_PARENT_DISTANCE,
            `${exchange.giver} → ${exchange.receiver}`,
          );
        });
      });

      it('has no swaps (A gives to B and B gives to A)', () => {
        const { result } = algo.run(tree, giverType, receiverType, []);
        result.forEach((exchange) => {
          const isSwap = result.some((other) => other.giver === exchange.receiver && other.receiver === exchange.giver);
          assert.ok(!isSwap, `${exchange.giver} ⇄ ${exchange.receiver}`);
        });
      });

      it('never repeats last year’s match', () => {
        for (let draw = 0; draw < REPEATED_DRAWS; draw++) {
          const lastYear = toHistory(algo.run(tree, giverType, receiverType, []).result);
          const { result } = algo.run(tree, giverType, receiverType, lastYear);
          realMatches(result).forEach((exchange) => {
            const lastYearMatch = lastYear.find((previous) => previous.giver === exchange.giver);
            assert.notEqual(exchange.receiver, lastYearMatch?.receiver, `${exchange.giver} repeated`);
          });
        }
      });
    });
  });

  it('gives young adults cousins or further rather than siblings', () => {
    for (let draw = 0; draw < REPEATED_DRAWS; draw++) {
      realMatches(algo.run(tree, YOUNG_ADULT, YOUNG_ADULT, []).result).forEach((exchange) => {
        assert.ok(
          algo.getSocialDistance(tree, exchange.giver, exchange.receiver) > SIBLING_DISTANCE + 1,
          `${exchange.giver} → ${exchange.receiver}`,
        );
      });
    }
  });

  it('keeps old guard away from their own siblings when in-laws make that possible', () => {
    for (let draw = 0; draw < REPEATED_DRAWS; draw++) {
      const lastYear = toHistory(algo.run(tree, OLD_GUARD, OLD_GUARD, []).result);
      realMatches(algo.run(tree, OLD_GUARD, OLD_GUARD, lastYear).result).forEach((exchange) => {
        assert.ok(
          algo.getSocialDistance(tree, exchange.giver, exchange.receiver) > SIBLING_DISTANCE,
          `${exchange.giver} → ${exchange.receiver}`,
        );
      });
    }
  });

  it('records the giver and receiver ids from the tree', () => {
    const { result } = algo.run(tree, YOUNG_ADULT, YOUNG_ADULT, []);
    result.forEach((exchange) => {
      assert.equal(exchange.giver_id, algo.findNode(tree, exchange.giver).ID);
      assert.equal(exchange.receiver_id, algo.findNode(tree, exchange.receiver).ID);
    });
  });

  it('returns no matches when nobody can receive', () => {
    const tinyTree = algo.compileTree([
      { id: 1, name: 'Judy McGannon', partner: 'Peter Nagel', family_member_type: OLD_GUARD, parent_id: null, participating_this_year: 'true' },
    ]);
    assert.deepEqual(algo.run(tinyTree, OLD_GUARD, KID, []).result, []);
  });

  describe('years off (more old guard than kids)', () => {
    const oldGuard = participatingPeople(OLD_GUARD);
    const kids = participatingPeople(KID);

    function lastYearWithYearOffs(peopleSittingOut) {
      const giving = oldGuard.filter((person) => !peopleSittingOut.includes(person));
      return [
        ...peopleSittingOut.map((giver) => ({ giver, receiver: algo.NO_RECIPIENT })),
        ...giving.map((giver, index) => ({ giver, receiver: kids[index % kids.length] })),
      ];
    }

    function yearOffs(result) {
      return result.filter((exchange) => exchange.receiver === algo.NO_RECIPIENT).map((exchange) => exchange.giver);
    }

    it('does not sit anyone out two years running when it can be avoided', () => {
      const satOutLastYear = oldGuard.slice(0, oldGuard.length - kids.length);
      for (let draw = 0; draw < REPEATED_DRAWS; draw++) {
        const { result } = algo.run(tree, OLD_GUARD, KID, lastYearWithYearOffs(satOutLastYear));
        const repeated = yearOffs(result).filter((giver) => satOutLastYear.includes(giver));
        assert.deepEqual(repeated, [], 'sat out again');
      }
    });

    it('only repeats as many years off as it has to', () => {
      const tooManySatOut = oldGuard.slice(0, kids.length + 2);
      const { result } = algo.run(tree, OLD_GUARD, KID, lastYearWithYearOffs(tooManySatOut));
      const repeated = yearOffs(result).filter((giver) => tooManySatOut.includes(giver));
      assert.equal(repeated.length, tooManySatOut.length - kids.length);
    });
  });
});
