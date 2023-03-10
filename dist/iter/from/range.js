import { createIter } from "..";
import { iterInfinite } from "../generators/iterInfinite";
export function range(from, to, inclusive = false) {
    if (from > to) {
        throw new Error(`Invalid range: From(${from}) > To(${to})`);
    }
    const extra = inclusive ? 1 : 0;
    return createIter(() => iterInfinite())
        .take(to - from + extra)
        .enumerate()
        .map(({ index }) => index + from);
}
