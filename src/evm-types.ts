import type { At, Expect, Equal, JoinHex, NormalizeHex, SplitAt, IsZeroHex, HexEq, AddHex, BuildTuple, NotHex, HexLT, HexGT, HexSLT, HexSGT, SubHex, AndHex, OrHex, XorHex, ByteAtHex, SignExtendHex, ShlHex, ShrHex, SarHex } from './type-utils';

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
// Gas-aware results
export type ExecOkGas<
  Stack extends string[],
  Ret extends string | null,
  GasUsed extends unknown[],
  GasLimit extends number
> = ExecOk<Stack, Ret> & {
  gasUsed: GasUsed['length'];
  gasLimit: GasLimit;
};

export type ExecErrGas<
  Reason extends string,
  Stack extends string[],
  GasUsed extends unknown[],
  GasLimit extends number
> = ExecErr<Reason, Stack> & {
  gasUsed: GasUsed['length'];
  gasLimit: GasLimit;
};

// Take first N elements and also provide tail
export type TakeAndDrop<
  A extends string[],
  N extends number
> = SplitAt<A, N>;

export type ConcatAsHex<S extends string[]> = `0x${JoinHex<S>}`;

// Gas schedule (approximate, configurable via generic gas limit only)
// Values chosen to reflect typical EVM costs for implemented ops.
type GasCostFor<Op extends string> =
  Op extends '00' // STOP
    ? 0
    : Op extends '01' | '03' // ADD, SUB
    ? 3
    : Op extends '19' // NOT
    ? 3
    : Op extends '0B' // SIGNEXTEND
    ? 3
    : Op extends '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '1A' | '1B' | '1C' | '1D' // + SHL/SHR/SAR
    ? 3
    : Op extends '16' | '17' | '18' | '19' // AND/OR/XOR/NOT
    ? 3
    : Op extends '3D' | '3E' // RETURNDATASIZE, RETURNDATACOPY
    ? 3
    : Op extends '50' // POP
    ? 2
    : Op extends '5B' // JUMPDEST
    ? 1
    : Op extends '59' // MSIZE
    ? 2
    : Op extends '5F' // PUSH0
    ? 2
    : Op extends Keys<PushLenMap> // PUSH1-32
    ? 3
    : Op extends Keys<DupIndexMap> // DUP1-16
    ? 3
    : Op extends Keys<SwapIndexMap> // SWAP1-16
    ? 3
    : Op extends 'A0' | 'A1' | 'A2' | 'A3' | 'A4' // LOG0-LOG4
    ? 3
    : Op extends 'F3' | 'FD' | 'FE' // RETURN/REVERT/INVALID (ignoring dynamic memory costs)
    ? 0
    : 0;

type Charge<GasUsed extends unknown[], Cost extends number> = [...GasUsed, ...BuildTuple<Cost>];
type CanAfford<GasUsed extends unknown[], Cost extends number, Limit extends number> =
  SplitAt<Charge<GasUsed, Cost>, Limit> extends [any, infer Remainder]
    ? Remainder extends []
      ? true
      : false
    : false;

// Execution engine: consumes an array of hex bytes and a stack
export type Exec<
  Bytes extends string[],
  Stack extends string[] = [],
  Steps extends unknown[] = [],
  GasUsed extends unknown[] = [],
  GasLimit extends number = 1000
> = Steps['length'] extends 256
  ? ExecErrGas<'step_overflow', Stack, GasUsed, GasLimit>
  : Bytes extends [infer Op extends string, ...infer Rest extends string[]]
  ? Op extends '00' // STOP (optional: treat as halt without return)
    ? CanAfford<GasUsed, GasCostFor<'00'>, GasLimit> extends true
      ? ExecOkGas<Stack, null, Charge<GasUsed, GasCostFor<'00'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '5B' // JUMPDEST (no-op)
    ? CanAfford<GasUsed, GasCostFor<'5B'>, GasLimit> extends true
      ? Exec<Rest, Stack, [...Steps, 1], Charge<GasUsed, GasCostFor<'5B'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '5F' // PUSH0
    ? CanAfford<GasUsed, GasCostFor<'5F'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, '0x00'>, [...Steps, 1], Charge<GasUsed, GasCostFor<'5F'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '59' // MSIZE (no memory model -> 0)
    ? CanAfford<GasUsed, GasCostFor<'59'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, '0x00'>, [...Steps, 1], Charge<GasUsed, GasCostFor<'59'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '3D' // RETURNDATASIZE (no external call context -> 0)
    ? CanAfford<GasUsed, GasCostFor<'3D'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, '0x00'>, [...Steps, 1], Charge<GasUsed, GasCostFor<'3D'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '3E' // RETURNDATACOPY (pops 3 items, no-op - memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'3E'>, GasLimit> extends true
      ? Stack extends [infer DestOffset extends string, infer Offset extends string, infer Size extends string, ...infer S2 extends string[]]
        ? Exec<Rest, S2, [...Steps, 1], Charge<GasUsed, GasCostFor<'3E'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'3E'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends 'FD' // REVERT
    ? CanAfford<GasUsed, GasCostFor<'FD'>, GasLimit> extends true
      ? ExecErrGas<'revert', Stack, Charge<GasUsed, GasCostFor<'FD'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends 'FE' // INVALID
    ? CanAfford<GasUsed, GasCostFor<'FE'>, GasLimit> extends true
      ? ExecErrGas<'invalid', Stack, Charge<GasUsed, GasCostFor<'FE'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends 'F3' // RETURN
    ? CanAfford<GasUsed, GasCostFor<'F3'>, GasLimit> extends true
      ? ExecOkGas<Stack, Top<Stack> extends string ? Top<Stack> : null, Charge<GasUsed, GasCostFor<'F3'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '50' // POP
    ? CanAfford<GasUsed, GasCostFor<'50'>, GasLimit> extends true
      ? Stack extends [any, ...infer S2 extends string[]]
        ? Exec<Rest, S2, [...Steps, 1], Charge<GasUsed, GasCostFor<'50'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'50'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '14' // EQ
    ? CanAfford<GasUsed, GasCostFor<'14'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexEq<A, B> extends true ? '0x01' : '0x00'>, [...Steps, 1], Charge<GasUsed, GasCostFor<'14'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'14'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '15' // ISZERO
    ? CanAfford<GasUsed, GasCostFor<'15'>, GasLimit> extends true
      ? Stack extends [infer A extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, IsZeroHex<A> extends true ? '0x01' : '0x00'>, [...Steps, 1], Charge<GasUsed, GasCostFor<'15'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'15'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '19' // NOT
    ? CanAfford<GasUsed, GasCostFor<'19'>, GasLimit> extends true
      ? Stack extends [infer A extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, NotHex<A>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'19'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'19'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '0B' // SIGNEXTEND
    ? CanAfford<GasUsed, GasCostFor<'0B'>, GasLimit> extends true
      ? Stack extends [infer Index extends string, infer Value extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, SignExtendHex<Index, Value>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'0B'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'0B'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '01' // ADD
    ? CanAfford<GasUsed, GasCostFor<'01'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, AddHex<A, B>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'01'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'01'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '03' // SUB
    ? CanAfford<GasUsed, GasCostFor<'01'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, SubHex<A, B>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'01'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'01'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '10' // LT
    ? CanAfford<GasUsed, GasCostFor<'10'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexLT<A, B> extends true ? '0x01' : '0x00'>, [...Steps, 1], Charge<GasUsed, GasCostFor<'10'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'10'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '11' // GT
    ? CanAfford<GasUsed, GasCostFor<'11'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexGT<A, B> extends true ? '0x01' : '0x00'>, [...Steps, 1], Charge<GasUsed, GasCostFor<'11'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'11'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '12' // SLT
    ? CanAfford<GasUsed, GasCostFor<'12'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexSLT<A, B> extends true ? '0x01' : '0x00'>, [...Steps, 1], Charge<GasUsed, GasCostFor<'12'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'12'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '13' // SGT
    ? CanAfford<GasUsed, GasCostFor<'13'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexSGT<A, B> extends true ? '0x01' : '0x00'>, [...Steps, 1], Charge<GasUsed, GasCostFor<'13'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'13'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '16' // AND
    ? CanAfford<GasUsed, GasCostFor<'16'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, AndHex<A, B>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'16'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'16'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '17' // OR
    ? CanAfford<GasUsed, GasCostFor<'17'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, OrHex<A, B>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'17'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'17'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '18' // XOR
    ? CanAfford<GasUsed, GasCostFor<'18'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, XorHex<A, B>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'18'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'18'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '1A' // BYTE
    ? CanAfford<GasUsed, GasCostFor<'1A'>, GasLimit> extends true
      ? Stack extends [infer I extends string, infer W extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, ByteAtHex<I, W>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'1A'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'1A'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '1B' // SHL
    ? CanAfford<GasUsed, GasCostFor<'1B'>, GasLimit> extends true
      ? Stack extends [infer Shift extends string, infer Val extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, ShlHex<Shift, Val>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'1B'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'1B'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '1C' // SHR
    ? CanAfford<GasUsed, GasCostFor<'1C'>, GasLimit> extends true
      ? Stack extends [infer Shift extends string, infer Val extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, ShrHex<Shift, Val>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'1C'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'1C'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends '1D' // SAR
    ? CanAfford<GasUsed, GasCostFor<'1D'>, GasLimit> extends true
      ? Stack extends [infer Shift extends string, infer Val extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, SarHex<Shift, Val>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'1D'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'1D'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends 'A0' // LOG0 (pops offset, size; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A0'>, GasLimit> extends true
      ? Stack extends [any, any, ...infer S2 extends string[]]
        ? Exec<Rest, S2, [...Steps, 1], Charge<GasUsed, GasCostFor<'A0'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'A0'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends 'A1' // LOG1 (pops offset, size, topic1; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A1'>, GasLimit> extends true
      ? Stack extends [any, any, any, ...infer S3 extends string[]]
        ? Exec<Rest, S3, [...Steps, 1], Charge<GasUsed, GasCostFor<'A1'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'A1'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends 'A2' // LOG2 (pops offset, size, topic1, topic2; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A2'>, GasLimit> extends true
      ? Stack extends [any, any, any, any, ...infer S4 extends string[]]
        ? Exec<Rest, S4, [...Steps, 1], Charge<GasUsed, GasCostFor<'A2'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'A2'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends 'A3' // LOG3 (pops offset, size, topic1, topic2, topic3; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A3'>, GasLimit> extends true
      ? Stack extends [any, any, any, any, any, ...infer S5 extends string[]]
        ? Exec<Rest, S5, [...Steps, 1], Charge<GasUsed, GasCostFor<'A3'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'A3'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : Op extends 'A4' // LOG4 (pops offset, size, topic1, topic2, topic3, topic4; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A4'>, GasLimit> extends true
      ? Stack extends [any, any, any, any, any, any, ...infer S6 extends string[]]
        ? Exec<Rest, S6, [...Steps, 1], Charge<GasUsed, GasCostFor<'A4'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'A4'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : IsPush<Op> extends true
    ? PushLen<Op> extends number
      ? CanAfford<GasUsed, GasCostFor<'60'>, GasLimit> extends true
        ? TakeAndDrop<Rest, PushLen<Op>> extends [infer ValBytes extends string[], infer Next extends string[]]
          ? ValBytes['length'] extends PushLen<Op>
            ? Exec<Next, Push<Stack, ConcatAsHex<ValBytes>>, [...Steps, 1], Charge<GasUsed, GasCostFor<'60'>>, GasLimit>
            : ExecErrGas<'bytecode_truncated', Stack, Charge<GasUsed, GasCostFor<'60'>>, GasLimit>
          : ExecErrGas<'bytecode_truncated', Stack, Charge<GasUsed, GasCostFor<'60'>>, GasLimit>
        : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
      : ExecErrGas<'invalid_push', Stack, GasUsed, GasLimit>
    : IsDup<Op> extends true
    ? CanAfford<GasUsed, GasCostFor<'80'>, GasLimit> extends true
      ? DupN<Op> extends infer N extends number
        ? AtZeroBased<Stack, Dec<N>> extends infer V extends string | never
          ? [V] extends [never]
            ? ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'80'>>, GasLimit>
            : Exec<Rest, Push<Stack, V>, [...Steps, 1], Charge<GasUsed, GasCostFor<'80'>>, GasLimit>
          : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'80'>>, GasLimit>
        : ExecErrGas<'invalid_dup', Stack, Charge<GasUsed, GasCostFor<'80'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : IsSwap<Op> extends true
    ? CanAfford<GasUsed, GasCostFor<'90'>, GasLimit> extends true
      ? SwapN<Op> extends infer N extends number
        ? Stack extends [infer H extends string, ...infer T extends string[]]
          ? SplitAt<T, Dec<N>> extends [infer Pre extends string[], infer Post extends string[]]
            ? Post extends [infer Target extends string, ...infer PostRest extends string[]]
              ? Exec<Rest, [Target, ...Pre, H, ...PostRest], [...Steps, 1], Charge<GasUsed, GasCostFor<'90'>>, GasLimit>
              : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'90'>>, GasLimit>
            : ExecErrGas<'swap_failed', Stack, Charge<GasUsed, GasCostFor<'90'>>, GasLimit>
          : ExecErrGas<'stack_underflow', Stack, Charge<GasUsed, GasCostFor<'90'>>, GasLimit>
        : ExecErrGas<'invalid_swap', Stack, Charge<GasUsed, GasCostFor<'90'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, GasUsed, GasLimit>
    : ExecErrGas<'unknown_opcode', Stack, GasUsed, GasLimit>
  : ExecOkGas<Stack, null, GasUsed, GasLimit>;

// No extra helpers needed for SWAP using SplitAt

// Public API
export type ExecuteEvm<
  Hex extends string,
  GasLimit extends number = 1000
> = Exec<HexToBytes<NormalizeHex<Hex>>, [], [], [], GasLimit>;

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

// ADD examples
// PUSH1 0x05, PUSH1 0x03, ADD, RETURN => 5 + 3 = 8
export type T13 = Expect<Equal<ExecuteEvm<'0x6005600301F3'>['returnData'], '0x8'>>;
// PUSH1 0xFF, PUSH1 0x01, ADD, RETURN => 255 + 1 = 256 = 0x100
export type T14 = Expect<Equal<ExecuteEvm<'0x60FF600101F3'>['returnData'], '0x100'>>;
// PUSH1 0x0A, PUSH1 0x14, ADD, RETURN => 10 + 20 = 30 = 0x1E
export type T15 = Expect<Equal<ExecuteEvm<'0x600A601401F3'>['returnData'], '0x1E'>>;
// ADD with stack underflow
export type T16 = Expect<Equal<ExecuteEvm<'0x600101F3'>['status'], 'error'>>;

// SUB check: 5 - 3 = 2 using SWAP1
// Additional opcode tests live in type-tests-const.ts
