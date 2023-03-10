import test, { ExecutionContext } from "ava";
import { None, Some } from "../option";
import { useSpy } from "../testutils/spy";
import { IterFrom } from "./from";

function nativeRange(from: number, to: number, inclusive = false) {
  if (from > to) {
    throw new Error(`Invalid Range: From(${from}) > To(${to})`);
  }
  return Array.from(
    { length: inclusive ? to - from + 1 : to - from },
    (_, i) => i + from
  );
}

test(`.[Symbol.iterator]()`, (t) => {
  const values = [1, 2, 3, 4, 5];
  const iter = IterFrom.array(values);
  t.deepEqual([...iter], values);
  // Inner state immutable
  t.deepEqual([...iter], values);
  t.true(iter.next().eq(Some(values[0])));
});

test(`.filter()`, (t) => {
  const iter = IterFrom.range(0, 10);
  // Clone test: initial iter should be untouched
  const evenIter = iter.filter((v) => v % 2 === 0);
  const oddIter = iter.filter((v) => v % 2 !== 0);
  const evenValues = nativeRange(0, 10).filter((v) => v % 2 === 0);
  const oddValues = nativeRange(0, 10).filter((v) => v % 2 !== 0);

  t.deepEqual(evenIter.collect(), evenValues);
  t.deepEqual(oddIter.collect(), oddValues);
});
test(`.filterMap()`, (t) => {
  const iter = IterFrom.range(0, 10);
  function even(v: number) {
    return v % 2 === 0 ? Some(v) : None();
  }
  function odd(v: number) {
    return v % 2 !== 0 ? Some(v) : None();
  }
  // Clone test: initial iter should be untouched
  const evenIter = iter.filterMap(even);
  const oddIter = iter.filterMap(odd);
  const evenValues = nativeRange(0, 10).filter((v) => v % 2 === 0);
  const oddValues = nativeRange(0, 10).filter((v) => v % 2 !== 0);

  t.deepEqual(evenIter.collect(), evenValues);
  t.deepEqual(oddIter.collect(), oddValues);
});
test(`.map()`, (t) => {
  const iter = IterFrom.range(0, 5);
  // Clone test: initial iter should be untouched
  const iterTwo = iter.map((v) => v * 2);
  const iterThree = iter.map((v) => v * 3);
  const mappedTwo = nativeRange(0, 5).map((v) => v * 2);
  const mappedThree = nativeRange(0, 5).map((v) => v * 3);

  t.deepEqual(iterTwo.collect(), mappedTwo);
  t.deepEqual(iterThree.collect(), mappedThree);
});
test(`.enumerate()`, (t) => {
  const iter = IterFrom.range(3, 7);
  // Clone test: initial iter should be untouched
  const enumeratedIter = iter.enumerate();
  const enumerate = (item: number, index: number) => ({ item, index });
  const enumeratedValues = nativeRange(3, 7).map(enumerate);

  t.deepEqual(iter.collect(), nativeRange(3, 7));
  t.deepEqual(enumeratedIter.collect(), enumeratedValues);
});

function testSkipWhile(
  t: ExecutionContext,
  [from, to]: [number, number],
  until: number
) {
  // Repeat range twice to test that we not skipping values
  const values = [
    ...nativeRange(from, to, true),
    ...nativeRange(from, to, true),
  ];
  // Our way
  const spyFilter = useSpy((item: number) => item < until);
  const iter = IterFrom.array(values);
  // Clone test: initial iter should be untouched
  const skippedIter = iter.skipWhile(spyFilter.spy);

  // Normal way
  const startFrom = values.findIndex((item) => item === until);
  const skippedValues = values.slice(Math.max(0, startFrom));

  t.deepEqual(iter.collect(), values);
  t.deepEqual(skippedIter.collect(), skippedValues);
  // Filter should be called startFrom + 1 times
  t.is(spyFilter.calledTimes(), startFrom + 1);
}

test(`.skipWhile()`, (t) => {
  testSkipWhile(t, [1, 5], 3);
  testSkipWhile(t, [1, 5], 5); // skip all
  testSkipWhile(t, [1, 5], 1); // skip none
});

test(`.skip()`, (t) => {
  const iter = IterFrom.range(3, 10);
  const values = nativeRange(3, 10);

  // Clone test: initial iter should be untouched
  const skippedIter = iter.skip(3);
  const skippedValues = values.slice(3);

  t.deepEqual(iter.collect(), values);
  t.deepEqual(skippedIter.collect(), skippedValues);
});

function testTakeWhile(
  t: ExecutionContext,
  [from, to]: [number, number],
  condition: (item: number) => boolean
) {
  // Repeat range twice to test that we not taking values twice
  const values = [
    ...nativeRange(from, to, true),
    ...nativeRange(from, to, true),
  ];
  // Our way
  const spyFilter = useSpy(condition);
  const iter = IterFrom.array(values);
  // Clone test: initial iter should be untouched
  const skippedIter = iter.takeWhile(spyFilter.spy);

  // Normal way
  const endAt = values.findIndex((item) => !condition(item));
  const endAtWrapped = endAt < 0 ? values.length : endAt;
  const takenValues = values.slice(0, endAtWrapped);

  t.deepEqual(iter.collect(), values);
  t.deepEqual(skippedIter.collect(), takenValues);

  // Filter should be called min(takenValues.length + 1, values.length) times
  t.is(
    spyFilter.calledTimes(),
    Math.min(takenValues.length + 1, values.length)
  );
}
test(`.takeWhile()`, (t) => {
  testTakeWhile(t, [1, 5], (item) => item !== 3);
  testTakeWhile(t, [1, 5], () => true); // take all
  testTakeWhile(t, [1, 5], () => false); // take none
});

test(`.take()`, (t) => {
  const iter = IterFrom.range(3, 10);
  const values = nativeRange(3, 10);

  // Clone test: initial iter should be untouched
  const takenIter = iter.take(3);
  const takenValues = values.slice(0, 3);

  t.deepEqual(iter.collect(), values);
  t.deepEqual(takenIter.collect(), takenValues);
});

test(`.nth()`, (t) => {
  const iter = IterFrom.range(0, 10);
  t.true(Some(2).eq(iter.nth(2)));
  t.true(Some(0).eq(iter.nth(0)));
  t.true(None().eq(iter.nth(100)));
});
test(`.all()`, (t) => {
  const iter = IterFrom.range(0, 10, true);
  t.true(iter.all((v) => typeof v === "number"));
  t.false(iter.all((v) => v < 10));
  t.true(IterFrom.array([]).all(() => false));
});
test(`.any()`, (t) => {
  const iter = IterFrom.range(0, 10, true);
  t.true(iter.any((v) => v === 5));
  t.false(iter.any((v) => v < 0));
  t.false(IterFrom.array([]).any(() => true));
});
test(`.next()`, (t) => {
  const iter = IterFrom.array([1, 2, 3, 4]);
  t.true(Some(1).eq(iter.next()));
  t.true(Some(2).eq(iter.next()));
  t.true(Some(3).eq(iter.next()));
  t.true(Some(4).eq(iter.next()));
  t.true(None().eq(iter.next()));
});
test(`.reset()`, (t) => {
  const iter = IterFrom.array([1, 2]);
  t.true(Some(1).eq(iter.next()));
  t.true(Some(2).eq(iter.next()));
  t.true(None().eq(iter.next()));
  const iter2 = iter.recreate();
  t.true(Some(1).eq(iter2.next()));
  t.true(Some(2).eq(iter2.next()));
  t.true(None().eq(iter2.next()));
});
test(`.cycle()`, (t) => {
  const iter = IterFrom.array([1, 2]).cycle();
  for (const _ of nativeRange(0, 5)) {
    t.true(Some(1).eq(iter.next()));
    t.true(Some(2).eq(iter.next()));
  }
  const emptyIter = IterFrom.array([]).cycle();
  for (const _ of nativeRange(0, 5)) {
    t.true(None().eq(emptyIter.next()));
  }
});
test(`.eq()`, (t) => {
  const iter1 = IterFrom.array([1, 2]);
  const iter2 = IterFrom.array([1, 2]);
  const iter3 = IterFrom.array([1, 2, 3]);

  t.true(iter1.eq(iter2));
  t.false(iter2.eq(iter3));
  t.false(iter3.eq(iter1));
});
test(`.eq(by)`, (t) => {
  const iter1 = IterFrom.array([1, 2]).map((v) => ({ v }));
  const iter2 = IterFrom.array([1, 2]).map((v) => ({ v }));
  const iter3 = IterFrom.array([1, 2, 3]).map((v) => ({ v }));

  t.true(iter1.eq(iter2, (v) => v.v));
  t.false(iter2.eq(iter3, (v) => v.v));
  t.false(iter3.eq(iter1, (v) => v.v));
});
test(`.findMap()`, (t) => {
  const iter = IterFrom.range(0, 10);
  const valueIfEq = (to: number) => {
    return (v: number) => {
      return v === to ? Some("value") : None();
    };
  };

  t.true(iter.findMap(valueIfEq(5)).eq(Some("value")));
  t.true(iter.findMap(valueIfEq(100)).eq(None()));
});
test(`.position()`, (t) => {
  const iter = IterFrom.range(0, 10);

  t.true(iter.position((v) => v === 5).eq(Some(5)));
  t.true(iter.position((v) => v === 100).eq(None()));
});
test(`.flatMap()`, (t) => {
  const iter = IterFrom.array([1, 2, [3]]);
  t.deepEqual(iter.flatMap((v) => [v]).collect(), [1, 2, [3]]);
  const iter2 = IterFrom.array([[1], [2], [3]]);
  t.deepEqual(iter2.flatMap(IterFrom.array).collect(), [1, 2, 3]);
});
test(`.flatten()`, (t) => {
  const iter = IterFrom.array([1, 2, [3]]);
  t.deepEqual(iter.flatten().collect(), [1, 2, 3]);
  const iter2 = IterFrom.array([IterFrom.array([1]), [2], [3]]);
  t.deepEqual(iter2.flatten().collect(), [1, 2, 3]);
});
test(`.fold()`, (t) => {
  const iter = IterFrom.array([1, 2, 3]);
  t.is(
    iter.fold(0, (acc, item) => acc + item),
    6
  );
  const iter2 = IterFrom.array([]);
  t.is(
    iter2.fold(0, (acc, item) => acc + item),
    0
  );
});
test(`.stepBy()`, (t) => {
  const iter = IterFrom.range(1, 11, true);
  t.throws(() => iter.stepBy(0));
  t.deepEqual(iter.stepBy(1).collect(), IterFrom.range(1, 11, true).collect());
  t.deepEqual(iter.stepBy(2).collect(), [1, 3, 5, 7, 9, 11]);
  t.deepEqual(iter.stepBy(3).collect(), [1, 4, 7, 10]);
  t.deepEqual(iter.stepBy(4).collect(), [1, 5, 9]);
  t.deepEqual(iter.stepBy(5).collect(), [1, 6, 11]);
  t.deepEqual(iter.stepBy(6).collect(), [1, 7]);
  t.deepEqual(iter.stepBy(7).collect(), [1, 8]);
  t.deepEqual(iter.stepBy(8).collect(), [1, 9]);
  t.deepEqual(iter.stepBy(9).collect(), [1, 10]);
  t.deepEqual(iter.stepBy(10).collect(), [1, 11]);
  t.deepEqual(iter.stepBy(11).collect(), [1]);
});
test(`.forEach()`, (t) => {
  const myFn = useSpy(() => {});
  const iter = IterFrom.range(0, 10);
  iter.forEach(myFn.spy);
  t.is(myFn.calledTimes(), 10);

  for (const i of nativeRange(0, 10)) {
    t.deepEqual(myFn.calledWith(i), [i]);
  }
});
