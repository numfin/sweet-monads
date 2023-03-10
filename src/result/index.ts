export { ResultFrom as EitherFrom } from "./from";
export * from "./interfaces";

import { and } from "./api/and";
import { or } from "./api/or";
import { andThen } from "./api/andThen";
import { orElse } from "./api/orElse";
import { eq } from "./api/eq";
import { format } from "./api/format";
import { inspect } from "./api/inspect";
import { inspectErr } from "./api/inspectErr";
import { isOk } from "./api/isOk";
import { isOkAnd } from "./api/isOkAnd";
import { isErr } from "./api/isErr";
import { isErrAnd } from "./api/isRightAnd";
import { map } from "./api/map";
import { mapErr } from "./api/mapErr";
import { ok } from "./api/ok";
import { err } from "./api/err";
import { unwrap } from "./api/unwrap";
import { uwnrapOr } from "./api/unwrapOr";
import { unwrapErr } from "./api/unwrapErr";
import { unwrapErrOr } from "./api/unwrapErrOr";
import type { Result, ResultUnion, Ok, Err } from "./interfaces";
import { unionOk } from "./api/unionOk";
import { unionErr } from "./api/unionErr";

export function createResult<T, E>(result: ResultUnion<T, E>): Result<T, E> {
  const api: Result<T, E> = {
    inner: () => result,
    eq: (other: Result<T, E>) => eq(api, other),
    format: () => format(result),
    isOk: () => isOk(result),
    isErr: () => isErr(result),
    unwrap: () => unwrap(api),
    unwrapErr: () => unwrapErr(api),
    unwrapOr: (default_value) => uwnrapOr(api, default_value),
    unwrapErrOr: (default_value) => unwrapErrOr(api, default_value),
    isOkAnd: (fn) => isOkAnd(api, fn),
    isErrAnd: (fn) => isErrAnd(api, fn),
    map: (fn) => createResult(map(result, fn)),
    mapErr: (fn) => createResult(mapErr(result, fn)),
    inspect: (fn) => inspect(api, fn),
    inspectErr: (fn) => inspectErr(api, fn),
    andThen: (fn) => createResult(andThen(api, fn)),
    orElse: (fn) => createResult(orElse(api, fn)),
    and: (new_value) => and(api, new_value),
    or: (new_value) => or(api, new_value),
    ok: () => ok(api),
    err: () => err(api),
  };
  return api;
}

export function Ok<T, E>(value: T) {
  return createResult<T, E>(unionOk(value));
}
export function Err<T, E>(value: E) {
  return createResult<T, E>(unionErr(value));
}
