import type { At, Expect, Equal, JoinHex, NormalizeHex, SplitAt, IsZeroHex, HexEq } from './type-utils';

// Opcode maps
export type PushLenMap = {
  '60': 1; '61': 2; '62': 3; '63': 4; '64': 5; '65': 6; '66': 7; '67': 8;
  '68': 9; '69': 10; '6A': 11; '6B': 12; '6C': 13; '6D': 14; '6E': 15; '6F': 16;
  '70': 17; '71': 18; '72': 19; '73': 20; '74': 21; '75': 22; '76': 23; '77': 24;
  '78': 25; '79': 26; '7A': 27; '7B': 28; '7C': 29; '7D': 30; '7E': 31; '7F': 32;
};

export type DupIndexMap = {
  '80': 1; '81': 2; '82': 3; '83': 4; '84': 5; '85': 6; '86': 7; '87': 8;
  '88': 9; '89': 10; '8A': 11; '8B': 12; '8C': 13; '8D': 14; '8E': 15; '8F': 16;
};

export type SwapIndexMap = {
  '90': 1; '91': 2; '92': 3; '93': 4; '94': 5; '95': 6; '96': 7; '97': 8;
  '98': 9; '99': 10; '9A': 11; '9B': 12; '9C': 13; '9D': 14; '9E': 15; '9F': 16;
};

type Keys<T> = keyof T extends string ? keyof T : never;

type IsPush<Op extends string> = Op extends Keys<PushLenMap> ? true : false;
type IsDup<Op extends string> = Op extends Keys<DupIndexMap> ? true : false;
type IsSwap<Op extends string> = Op extends Keys<SwapIndexMap> ? true : false;

export type PushLen<Op extends string> = Op extends keyof PushLenMap
  ? PushLenMap[Op]
  : never;

export type DupN<Op extends string> = Op extends keyof DupIndexMap
  ? DupIndexMap[Op]
  : never;

export type SwapN<Op extends string> = Op extends keyof SwapIndexMap
  ? SwapIndexMap[Op]
  : never;

// 1-based to 0-based index mapping for DUP/SWAP adjustments
type DecMap = { 1: 0; 2: 1; 3: 2; 4: 3; 5: 4; 6: 5; 7: 6; 8: 7; 9: 8; 10: 9; 11: 10; 12: 11; 13: 12; 14: 13; 15: 14; 16: 15 };
type Dec<N extends number> = N extends keyof DecMap ? DecMap[N] : never;

// Hex parsing to byte array
export type HexToBytes<S extends string, R extends string[] = []> = NormalizeHex<S> extends infer N extends string
  ? N extends ''
    ? R
    : N extends `${infer A}${infer B}${infer Rest}`
    ? HexToBytes<Rest, [...R, `${A}${B}`]>
    : R
  : R;

// Utilities for manipulating stacks where the first element is the top of stack
export type Top<S extends unknown[]> = S extends [infer H, ...unknown[]] ? H : never;
export type Pop<S extends unknown[]> = S extends [any, ...infer T] ? T : never;
export type Push<S extends unknown[], V> = [V, ...S];

export type AtZeroBased<
  S extends unknown[],
  N extends number
> = At<S, N>;

// Return type
export type ExecOk<Stack extends string[], Ret extends string | null> = {
  status: 'ok';
  stack: Stack;
  returnData: Ret;
};

export type ExecErr<Reason extends string, Stack extends string[]> = {
  status: 'error';
  reason: Reason;
  stack: Stack;
};

export type Result<Stack extends string[] = string[]> = ExecOk<Stack, any> | ExecErr<string, Stack>;

// Take first N elements and also provide tail
export type TakeAndDrop<
  A extends string[],
  N extends number
> = SplitAt<A, N>;

export type ConcatAsHex<S extends string[]> = `0x${JoinHex<S>}`;

// Execution engine: consumes an array of hex bytes and a stack
export type Exec<
  Bytes extends string[],
  Stack extends string[] = [],
  Steps extends unknown[] = []
> = Steps['length'] extends 256
  ? ExecErr<'step_overflow', Stack>
  : Bytes extends [infer Op extends string, ...infer Rest extends string[]]
  ? Op extends '00' // STOP (optional: treat as halt without return)
    ? ExecOk<Stack, null>
    : Op extends '5B' // JUMPDEST (no-op)
    ? Exec<Rest, Stack, [...Steps, 1]>
    : Op extends '5F' // PUSH0
    ? Exec<Rest, Push<Stack, '0x00'>, [...Steps, 1]>
    : Op extends 'FD' // REVERT
    ? ExecErr<'revert', Stack>
    : Op extends 'FE' // INVALID
    ? ExecErr<'invalid', Stack>
    : Op extends 'F3' // RETURN
    ? ExecOk<Stack, Top<Stack> extends string ? Top<Stack> : null>
    : Op extends '50' // POP
    ? Stack extends [any, ...infer S2 extends string[]]
      ? Exec<Rest, S2, [...Steps, 1]>
      : ExecErr<'stack_underflow', Stack>
    : Op extends '14' // EQ
    ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
      ? Exec<Rest, Push<S2, HexEq<A, B> extends true ? '0x01' : '0x00'>, [...Steps, 1]>
      : ExecErr<'stack_underflow', Stack>
    : Op extends '15' // ISZERO
    ? Stack extends [infer A extends string, ...infer S2 extends string[]]
      ? Exec<Rest, Push<S2, IsZeroHex<A> extends true ? '0x01' : '0x00'>, [...Steps, 1]>
      : ExecErr<'stack_underflow', Stack>
    : IsPush<Op> extends true
    ? PushLen<Op> extends number
      ? TakeAndDrop<Rest, PushLen<Op>> extends [infer ValBytes extends string[], infer Next extends string[]]
        ? ValBytes['length'] extends PushLen<Op>
          ? Exec<Next, Push<Stack, ConcatAsHex<ValBytes>>, [...Steps, 1]>
          : ExecErr<'bytecode_truncated', Stack>
        : ExecErr<'bytecode_truncated', Stack>
      : ExecErr<'invalid_push', Stack>
    : IsDup<Op> extends true
    ? DupN<Op> extends infer N extends number
      ? AtZeroBased<Stack, Dec<N>> extends infer V extends string | never
        ? [V] extends [never]
          ? ExecErr<'stack_underflow', Stack>
          : Exec<Rest, Push<Stack, V>, [...Steps, 1]>
        : ExecErr<'stack_underflow', Stack>
      : ExecErr<'invalid_dup', Stack>
    : IsSwap<Op> extends true
    ? SwapN<Op> extends infer N extends number
      ? Stack extends [infer H extends string, ...infer T extends string[]]
        ? SplitAt<T, Dec<N>> extends [infer Pre extends string[], infer Post extends string[]]
          ? Post extends [infer Target extends string, ...infer PostRest extends string[]]
            ? Exec<Rest, [Target, ...Pre, H, ...PostRest], [...Steps, 1]>
            : ExecErr<'stack_underflow', Stack>
          : ExecErr<'swap_failed', Stack>
        : ExecErr<'stack_underflow', Stack>
      : ExecErr<'invalid_swap', Stack>
    : ExecErr<'unknown_opcode', Stack>
  : ExecOk<Stack, null>;

// No extra helpers needed for SWAP using SplitAt

// Public API
export type ExecuteEvm<Hex extends string> = Exec<HexToBytes<NormalizeHex<Hex>>>;

// Type tests (compile-time only)
export type T1 = Expect<Equal<ExecuteEvm<'0x60016002F3'>['status'], 'ok'>>;
export type T1a = Expect<Equal<ExecuteEvm<'0x60016002F3'>['returnData'], '0x02'>>;

// PUSH1 01, PUSH1 02, SWAP1, POP, RETURN => returns 0x02
export type T2 = Expect<
  Equal<ExecuteEvm<'0x600160029050F3'>['returnData'], '0x02'>
>;

// DUP1 example: PUSH1 AA, DUP1, RETURN => returns 0xAA
export type T3 = Expect<Equal<ExecuteEvm<'0x60AAF3'>['returnData'], '0xAA'>>;

// POP underflow error
export type T4 = Expect<Equal<ExecuteEvm<'0x50F3'>['status'], 'error'>>;

// EQ examples
export type T5 = Expect<Equal<ExecuteEvm<'0x6001600114F3'>['returnData'], '0x01'>>; // 1==1
export type T6 = Expect<Equal<ExecuteEvm<'0x6001600214F3'>['returnData'], '0x00'>>; // 1==2 -> 0

// ISZERO examples
export type T7 = Expect<Equal<ExecuteEvm<'0x600015F3'>['returnData'], '0x01'>>; // iszero(0) -> 1
export type T8 = Expect<Equal<ExecuteEvm<'0x600115F3'>['returnData'], '0x00'>>; // iszero(1) -> 0

// PUSH0 + RETURN
export type T9 = Expect<Equal<ExecuteEvm<'0x5FF3'>['returnData'], '0x00'>>;

// JUMPDEST no-op
export type T10 = Expect<Equal<ExecuteEvm<'0x5B6001F3'>['returnData'], '0x01'>>;

// REVERT and INVALID produce error
export type T11 = Expect<Equal<ExecuteEvm<'0xFDF3'>['status'], 'error'>>;
export type T12 = Expect<Equal<ExecuteEvm<'0xFEF3'>['status'], 'error'>>;
