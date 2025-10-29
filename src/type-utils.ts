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

// Hex arithmetic types
export type HexDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

// Result of adding two hex digits: [carry (0 or 1), result digit]
export type HexAddResult<C extends 0 | 1, R extends HexDigit> = [C, R];

// Hex addition table (base 16)
type HexAddTableRow = [
  HexAddResult<0, '0'>, HexAddResult<0, '1'>, HexAddResult<0, '2'>, HexAddResult<0, '3'>,
  HexAddResult<0, '4'>, HexAddResult<0, '5'>, HexAddResult<0, '6'>, HexAddResult<0, '7'>,
  HexAddResult<0, '8'>, HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>,
  HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>
];

export type HexAdditionTable = {
  '0': HexAddTableRow;
  '1': [HexAddResult<0, '1'>, HexAddResult<0, '2'>, HexAddResult<0, '3'>, HexAddResult<0, '4'>, HexAddResult<0, '5'>, HexAddResult<0, '6'>, HexAddResult<0, '7'>, HexAddResult<0, '8'>, HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>];
  '2': [HexAddResult<0, '2'>, HexAddResult<0, '3'>, HexAddResult<0, '4'>, HexAddResult<0, '5'>, HexAddResult<0, '6'>, HexAddResult<0, '7'>, HexAddResult<0, '8'>, HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>];
  '3': [HexAddResult<0, '3'>, HexAddResult<0, '4'>, HexAddResult<0, '5'>, HexAddResult<0, '6'>, HexAddResult<0, '7'>, HexAddResult<0, '8'>, HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>];
  '4': [HexAddResult<0, '4'>, HexAddResult<0, '5'>, HexAddResult<0, '6'>, HexAddResult<0, '7'>, HexAddResult<0, '8'>, HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>];
  '5': [HexAddResult<0, '5'>, HexAddResult<0, '6'>, HexAddResult<0, '7'>, HexAddResult<0, '8'>, HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>];
  '6': [HexAddResult<0, '6'>, HexAddResult<0, '7'>, HexAddResult<0, '8'>, HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>];
  '7': [HexAddResult<0, '7'>, HexAddResult<0, '8'>, HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>, HexAddResult<1, '6'>];
  '8': [HexAddResult<0, '8'>, HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>, HexAddResult<1, '6'>, HexAddResult<1, '7'>];
  '9': [HexAddResult<0, '9'>, HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>, HexAddResult<1, '6'>, HexAddResult<1, '7'>, HexAddResult<1, '8'>];
  'A': [HexAddResult<0, 'A'>, HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>, HexAddResult<1, '6'>, HexAddResult<1, '7'>, HexAddResult<1, '8'>, HexAddResult<1, '9'>];
  'B': [HexAddResult<0, 'B'>, HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>, HexAddResult<1, '6'>, HexAddResult<1, '7'>, HexAddResult<1, '8'>, HexAddResult<1, '9'>, HexAddResult<1, 'A'>];
  'C': [HexAddResult<0, 'C'>, HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>, HexAddResult<1, '6'>, HexAddResult<1, '7'>, HexAddResult<1, '8'>, HexAddResult<1, '9'>, HexAddResult<1, 'A'>, HexAddResult<1, 'B'>];
  'D': [HexAddResult<0, 'D'>, HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>, HexAddResult<1, '6'>, HexAddResult<1, '7'>, HexAddResult<1, '8'>, HexAddResult<1, '9'>, HexAddResult<1, 'A'>, HexAddResult<1, 'B'>, HexAddResult<1, 'C'>];
  'E': [HexAddResult<0, 'E'>, HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>, HexAddResult<1, '6'>, HexAddResult<1, '7'>, HexAddResult<1, '8'>, HexAddResult<1, '9'>, HexAddResult<1, 'A'>, HexAddResult<1, 'B'>, HexAddResult<1, 'C'>, HexAddResult<1, 'D'>];
  'F': [HexAddResult<0, 'F'>, HexAddResult<1, '0'>, HexAddResult<1, '1'>, HexAddResult<1, '2'>, HexAddResult<1, '3'>, HexAddResult<1, '4'>, HexAddResult<1, '5'>, HexAddResult<1, '6'>, HexAddResult<1, '7'>, HexAddResult<1, '8'>, HexAddResult<1, '9'>, HexAddResult<1, 'A'>, HexAddResult<1, 'B'>, HexAddResult<1, 'C'>, HexAddResult<1, 'D'>, HexAddResult<1, 'E'>];
};

// Map hex digit to index 0-15
type HexToIndex = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, 'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
};

// Look up addition result
type LookupHexAdd<A extends HexDigit, B extends HexDigit> =
  HexAdditionTable[A][HexToIndex[B]];

// Add two hex digit strings with carry
type AddHexDigitWithCarry<A extends HexDigit, B extends HexDigit, Carry extends 0 | 1> =
  Carry extends 0
    ? LookupHexAdd<A, B>
    : LookupHexAdd<A, B> extends [infer C extends 0 | 1, infer R extends HexDigit]
      ? C extends 0
        ? LookupHexAdd<R, '1'>  // Add carry to result
        : [1, R]  // Already has carry, keep it
      : never;

// Pad hex string to length with leading zeros
type PadHexLeft<S extends string, TargetLen extends number, Acc extends unknown[] = []> =
  Acc['length'] extends TargetLen
    ? S
    : S extends `${infer _}${infer Rest}`
      ? Rest extends ''
        ? PadHexLeft<`0${S}`, TargetLen, [...Acc, unknown]>
        : PadHexLeft<S, TargetLen, [...Acc, unknown]>
      : PadHexLeft<`0${S}`, TargetLen, [...Acc, unknown]>;

// Split hex string into array of single hex digits
type HexStringToDigits<S extends string, Acc extends HexDigit[] = []> =
  S extends `${infer D extends HexDigit}${infer Rest}`
    ? HexStringToDigits<Rest, [...Acc, D]>
    : Acc;

// Join hex digits back to string
type HexDigitsToString<Digits extends HexDigit[]> =
  Digits extends [infer H extends HexDigit, ...infer T extends HexDigit[]]
    ? `${H}${HexDigitsToString<T>}`
    : '';

// Add two hex digit arrays from right to left with carry
type AddHexDigitArrays<
  A extends HexDigit[],
  B extends HexDigit[],
  Carry extends 0 | 1 = 0,
  Acc extends HexDigit[] = []
> = A extends [...infer RestA extends HexDigit[], infer LastA extends HexDigit]
  ? B extends [...infer RestB extends HexDigit[], infer LastB extends HexDigit]
    ? AddHexDigitWithCarry<LastA, LastB, Carry> extends [infer NewCarry extends 0 | 1, infer Result extends HexDigit]
      ? AddHexDigitArrays<RestA, RestB, NewCarry, [Result, ...Acc]>
      : never
    : never
  : Carry extends 1
    ? ['1', ...Acc]  // Overflow carry
    : Acc;

// Remove leading zeros
type TrimLeadingZeros<S extends string> =
  S extends '0'
    ? '0'
    : S extends `0${infer Rest}`
      ? Rest extends ''
        ? '0'
        : TrimLeadingZeros<Rest>
      : S;

// Get max length
type MaxLength<A extends unknown[], B extends unknown[]> =
  A['length'] extends B['length']
    ? A['length']
    : A extends [...B, ...unknown[]]
      ? A['length']
      : B['length'];

// Helper to get string length as number
type StringLength<S extends string, Acc extends unknown[] = []> =
  S extends `${infer _}${infer Rest}`
    ? StringLength<Rest, [...Acc, unknown]>
    : Acc['length'];

// Take last N characters from string
type TakeLast<S extends string, N extends number, Acc extends string = '', Count extends unknown[] = []> =
  Count['length'] extends N
    ? Acc
    : S extends `${infer Rest}${infer Last}`
      ? TakeLast<Rest, N, `${Last}${Acc}`, [...Count, unknown]>
      : Acc;

// Pad to u256 (64 hex digits) and take last 64 (simulates overflow)
export type WrapU256<S extends string> =
  StringLength<S> extends infer Len extends number
    ? Len extends 64
      ? S
      : Len extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63
        ? S  // Less than 64, no overflow
        : TakeLast<S, 64>  // More than 64, take last 64
    : never;

// Main add function for hex strings (assumes normalized uppercase hex without 0x prefix)
type AddHexRaw<A extends string, B extends string> =
  A extends ''
    ? B extends '' ? '00' : B
    : B extends ''
      ? A
      : HexStringToDigits<A> extends infer ADigits extends HexDigit[]
        ? HexStringToDigits<B> extends infer BDigits extends HexDigit[]
          ? MaxLength<ADigits, BDigits> extends infer MaxLen extends number
            ? PadHexLeft<A, MaxLen> extends infer PaddedA extends string
              ? PadHexLeft<B, MaxLen> extends infer PaddedB extends string
                ? HexStringToDigits<PaddedA> extends infer PaddedADigits extends HexDigit[]
                  ? HexStringToDigits<PaddedB> extends infer PaddedBDigits extends HexDigit[]
                    ? AddHexDigitArrays<PaddedADigits, PaddedBDigits> extends infer ResultDigits extends HexDigit[]
                      ? HexDigitsToString<ResultDigits> extends infer ResultStr extends string
                        ? TrimLeadingZeros<ResultStr>
                        : never
                      : never
                    : never
                  : never
                : never
              : never
            : never
          : never
        : never;

// Add two hex values with 0x prefix and wrap to u256
export type AddHex<A extends string, B extends string> =
  `0x${WrapU256<AddHexRaw<NormalizeHex<A>, NormalizeHex<B>>>}`;

// Bitwise helpers
export type Bit = 0 | 1;

type BitNot<B extends Bit> = B extends 1 ? 0 : 1;
type BitAnd<A extends Bit, B extends Bit> = A extends 1 ? (B extends 1 ? 1 : 0) : 0;
type BitOr<A extends Bit, B extends Bit> = A extends 1 ? 1 : (B extends 1 ? 1 : 0);
type BitXor<A extends Bit, B extends Bit> = A extends B ? 0 : 1;

// Map hex digit to 4-bit tuple (most-significant bit first)
type DigitBitsMap = {
  '0': [0, 0, 0, 0]; '1': [0, 0, 0, 1]; '2': [0, 0, 1, 0]; '3': [0, 0, 1, 1];
  '4': [0, 1, 0, 0]; '5': [0, 1, 0, 1]; '6': [0, 1, 1, 0]; '7': [0, 1, 1, 1];
  '8': [1, 0, 0, 0]; '9': [1, 0, 0, 1]; 'A': [1, 0, 1, 0]; 'B': [1, 0, 1, 1];
  'C': [1, 1, 0, 0]; 'D': [1, 1, 0, 1]; 'E': [1, 1, 1, 0]; 'F': [1, 1, 1, 1];
};

type BitsToDigitMap = {
  '[0,0,0,0]': '0'; '[0,0,0,1]': '1'; '[0,0,1,0]': '2'; '[0,0,1,1]': '3';
  '[0,1,0,0]': '4'; '[0,1,0,1]': '5'; '[0,1,1,0]': '6'; '[0,1,1,1]': '7';
  '[1,0,0,0]': '8'; '[1,0,0,1]': '9'; '[1,0,1,0]': 'A'; '[1,0,1,1]': 'B';
  '[1,1,0,0]': 'C'; '[1,1,0,1]': 'D'; '[1,1,1,0]': 'E'; '[1,1,1,1]': 'F';
};

type BitsToDigit<B extends [Bit, Bit, Bit, Bit]> =
  B extends [infer b3 extends Bit, infer b2 extends Bit, infer b1 extends Bit, infer b0 extends Bit]
    ? BitsToDigitMap[`[${b3},${b2},${b1},${b0}]`]
    : never;

type DigitNot<D extends HexDigit> = BitsToDigit<[
  BitNot<DigitBitsMap[D][0] & Bit>,
  BitNot<DigitBitsMap[D][1] & Bit>,
  BitNot<DigitBitsMap[D][2] & Bit>,
  BitNot<DigitBitsMap[D][3] & Bit>
]>;

type DigitAnd<A extends HexDigit, B extends HexDigit> = BitsToDigit<[
  BitAnd<DigitBitsMap[A][0] & Bit, DigitBitsMap[B][0] & Bit>,
  BitAnd<DigitBitsMap[A][1] & Bit, DigitBitsMap[B][1] & Bit>,
  BitAnd<DigitBitsMap[A][2] & Bit, DigitBitsMap[B][2] & Bit>,
  BitAnd<DigitBitsMap[A][3] & Bit, DigitBitsMap[B][3] & Bit>
]>;

type DigitOr<A extends HexDigit, B extends HexDigit> = BitsToDigit<[
  BitOr<DigitBitsMap[A][0] & Bit, DigitBitsMap[B][0] & Bit>,
  BitOr<DigitBitsMap[A][1] & Bit, DigitBitsMap[B][1] & Bit>,
  BitOr<DigitBitsMap[A][2] & Bit, DigitBitsMap[B][2] & Bit>,
  BitOr<DigitBitsMap[A][3] & Bit, DigitBitsMap[B][3] & Bit>
]>;

type DigitXor<A extends HexDigit, B extends HexDigit> = BitsToDigit<[
  BitXor<DigitBitsMap[A][0] & Bit, DigitBitsMap[B][0] & Bit>,
  BitXor<DigitBitsMap[A][1] & Bit, DigitBitsMap[B][1] & Bit>,
  BitXor<DigitBitsMap[A][2] & Bit, DigitBitsMap[B][2] & Bit>,
  BitXor<DigitBitsMap[A][3] & Bit, DigitBitsMap[B][3] & Bit>
]>;

// Map over hex string digits
type MapHexDigits<S extends string, F extends (d: HexDigit) => string> =
  S extends `${infer D extends HexDigit}${infer R}`
    ? `${ReturnType<F & ((d: HexDigit) => string)>}${MapHexDigits<R, F>}`
    : '';

// Implement NOT for a 64-hex-digit body
type NotHexBody<S extends string> =
  S extends `${infer D extends HexDigit}${infer R}`
    ? `${DigitNot<D>}${NotHexBody<R>}`
    : '';

// Implement AND/OR/XOR for 64-hex-digit bodies
type AndHexBody<A extends string, B extends string> =
  A extends `${infer Da extends HexDigit}${infer Ra}`
    ? B extends `${infer Db extends HexDigit}${infer Rb}`
      ? `${DigitAnd<Da, Db>}${AndHexBody<Ra, Rb>}`
      : ''
    : '';

type OrHexBody<A extends string, B extends string> =
  A extends `${infer Da extends HexDigit}${infer Ra}`
    ? B extends `${infer Db extends HexDigit}${infer Rb}`
      ? `${DigitOr<Da, Db>}${OrHexBody<Ra, Rb>}`
      : ''
    : '';

type XorHexBody<A extends string, B extends string> =
  A extends `${infer Da extends HexDigit}${infer Ra}`
    ? B extends `${infer Db extends HexDigit}${infer Rb}`
      ? `${DigitXor<Da, Db>}${XorHexBody<Ra, Rb>}`
      : ''
    : '';

// Public bitwise hex ops (0x-prefixed), operating on 256-bit words
// Efficient left pad to 64 by prefixing a 64-zero string and taking the last 64 chars
type Z64 = '0000000000000000000000000000000000000000000000000000000000000000';
type PadToU256Body<S extends string> = TakeLast<`${Z64}${NormalizeHex<S>}`, 64>;

type IsSpecificString<S extends string> = string extends S ? false : true;

export type NotHex<A extends string> = IsSpecificString<A> extends true
  ? `0x${TakeLast<`${'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'}${NotHexBody<NormalizeHex<A>>}`, 64>}`
  : never;
// (AND/OR/XOR helpers intentionally not exported yet to keep type instantiation light)

// Unsigned hex comparison helpers
type DigitVal = {
  '0': 0; '1': 1; '2': 2; '3': 3; '4': 4; '5': 5; '6': 6; '7': 7;
  '8': 8; '9': 9; 'A': 10; 'B': 11; 'C': 12; 'D': 13; 'E': 14; 'F': 15;
};

type NumLT<A extends number, B extends number> =
  BuildTuple<A> extends [...BuildTuple<B>, ...infer _]
    ? false
    : BuildTuple<B> extends [...BuildTuple<A>, ...infer _]
      ? true
      : false;

type CmpDigits<A extends string, B extends string> =
  A extends `${infer Da extends HexDigit}${infer Ra}`
    ? B extends `${infer Db extends HexDigit}${infer Rb}`
      ? Equal<Da, Db> extends true
        ? CmpDigits<Ra, Rb>
        : NumLT<DigitVal[Da], DigitVal[Db]>
      : false
    : false;

type TrimHex<S extends string> = TrimLeadingZeros<NormalizeHex<S>> extends infer T extends string
  ? T extends ''
    ? '0'
    : T
  : never;

type StrLen<S extends string> = StringLength<S>;

export type HexLT<A extends string, B extends string> =
  TrimHex<A> extends infer TA extends string
    ? TrimHex<B> extends infer TB extends string
      ? StrLen<TA> extends infer LA extends number
        ? StrLen<TB> extends infer LB extends number
          ? LA extends LB
            ? CmpDigits<TA, TB>
            : NumLT<LA, LB>
          : false
        : false
      : false
    : false;

export type HexGT<A extends string, B extends string> =
  HexLT<B, A>;

// TEMP sanity checks (will be removed later)
// Note: keep bitwise helpers lightweight; avoid extra compile-time tests here.
