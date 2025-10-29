// Minimal test utilities for type-level assertions
export type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (
  <T>() => T extends B ? 1 : 2
)
  ? true
  : false;

export type Expect<T extends true> = T;

// Tuple helpers
export type BuildTuple<
  N extends number,
  Acc extends unknown[] = []
> = Acc['length'] extends N ? Acc : BuildTuple<N, [...Acc, unknown]>;

export type Length<T extends unknown[]> = T['length'];

export type SplitAt<
  A extends unknown[],
  N extends number,
  Acc extends unknown[] = []
> = Acc['length'] extends N
  ? [Acc, A]
  : A extends [infer H, ...infer T]
  ? SplitAt<T, N, [...Acc, H]>
  : [Acc, []];

export type At<
  A extends unknown[],
  N extends number,
  I extends unknown[] = []
> = I['length'] extends N
  ? A extends [infer H, ...unknown[]]
    ? H
    : never
  : A extends [any, ...infer T]
  ? At<T, N, [...I, unknown]>
  : never;

export type ReplaceAt<
  A extends unknown[],
  N extends number,
  V,
  I extends unknown[] = [],
  Acc extends unknown[] = []
> = I['length'] extends N
  ? A extends [any, ...infer T]
    ? [...Acc, V, ...T]
    : Acc
  : A extends [infer H, ...infer T]
  ? ReplaceAt<T, N, V, [...I, unknown], [...Acc, H]>
  : Acc;

export type SwapAt<
  A extends unknown[],
  N extends number
> = A extends [infer H, ...infer T]
  ? ReplaceAt<ReplaceAt<A, N, H>, 0, At<A, N>>
  : A;

// String helpers
export type NormalizeHex<S extends string> = Uppercase<
  S extends `0x${infer R}` | `0X${infer R}` ? R : S
>;

export type JoinHex<
  A extends string[],
  Acc extends string = ''
> = A extends [infer H extends string, ...infer T extends string[]]
  ? JoinHex<T, `${Acc}${H}`>
  : Acc;

export type EnsureEven<S extends string> = `${S}` extends `${infer _}${infer _}${infer Rest}`
  ? Rest extends ''
    ? S
    : EnsureEven<Rest> extends string
    ? S
    : never
  : S extends ''
  ? S
  : never;

export type IsNever<T> = [T] extends [never] ? true : false;

// Hex helpers
export type HexBody<S extends string> = NormalizeHex<S>;

export type IsAllZeros<S extends string> = S extends ''
  ? true
  : S extends `${infer C}${infer R}`
  ? C extends '0'
    ? IsAllZeros<R>
    : false
  : false;

export type IsZeroHex<S extends string> = IsAllZeros<HexBody<S>>;

export type HexEq<A extends string, B extends string> = Equal<HexBody<A>, HexBody<B>>;
