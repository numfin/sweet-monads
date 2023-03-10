import test from "ava";
import { EitherApi, EitherFrom, Left } from "./either";
import { OptionFrom, Some } from "./option";

test(`Circular dependencies resolving`, (t) => {
  // Apis
  t.true(
    Some(3)
      .toLeft(() => 4)
      .eq(Left(3))
  );
  t.true(EitherApi.toLeftOption(Left(3)).eq(Some(3)));
  // Froms
  t.true(OptionFrom.eitherLeft(Left(3)).eq(Some(3)));
  t.true(EitherFrom.optionLeft(Some(3), () => 4).eq(Left(3)));
});
