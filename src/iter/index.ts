import { Iter } from "./interfaces";
import {
  ClonnableGenerator,
  iterEnumerate,
  iterFactory,
  iterInfinite,
  iterSkipWhile,
  iterTakeWhile,
} from "./gen";

function create_iter<T>(source: ClonnableGenerator<T>) {
  const api: Iter<T> = {
    collect: () => IterApi.collect(source),
    map: (fn) => IterApi.map(source, fn),
    filter: (fn) => IterApi.filter(source, fn),
    enumerate: () => IterApi.enumerate(source),
    skipWhile: (fn) => IterApi.skipWhile(source, fn),
    skip: (i) => IterApi.skip(api, i),
    takeWhile: (fn) => IterApi.takeWhile(source, fn),
    take: (i) => IterApi.take(api, i),
  };
  return api;
}

export namespace IterFrom {
  export function array<T>(source: T[]): Iter<T> {
    return create_iter(() => iterFactory(source));
  }
  export function range(from: number, to: number, inclusive = false) {
    if (from > to) {
      throw new Error(`Invalid range: From(${from}) > To(${to})`);
    }
    const extra = inclusive ? 1 : 0;
    return create_iter(() => iterInfinite())
      .take(to - from + extra)
      .enumerate()
      .map(({ index }) => index + from);
  }
}

export namespace IterApi {
  export function collect<T>(source: ClonnableGenerator<T>) {
    return Array.from(source());
  }
  export function map<T, U>(source: ClonnableGenerator<T>, fn: (item: T) => U) {
    return create_iter(() => iterFactory(source(), fn));
  }
  export function filter<T>(
    source: ClonnableGenerator<T>,
    fn: (item: T) => boolean
  ) {
    return create_iter(() => iterFactory(source(), (x) => x, fn));
  }
  export function enumerate<T>(source: ClonnableGenerator<T>) {
    return create_iter(() => iterEnumerate(source()));
  }
  export function skipWhile<T>(
    source: ClonnableGenerator<T>,
    fn: (item: T) => boolean
  ) {
    return create_iter(() => iterSkipWhile(source(), fn));
  }
  export function skip<T>(source: Iter<T>, skipAmount: number) {
    return source
      .enumerate()
      .skipWhile(({ index }) => index < skipAmount)
      .map(({ item }) => item);
  }
  export function takeWhile<T>(
    source: ClonnableGenerator<T>,
    fn: (item: T) => boolean
  ) {
    return create_iter(() => iterTakeWhile(source(), fn));
  }
  export function take<T>(source: Iter<T>, takeAmount: number) {
    return source
      .enumerate()
      .takeWhile(({ index }) => index < takeAmount)
      .map(({ item }) => item);
  }
}
