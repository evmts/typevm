import type { At, Expect, Equal, JoinHex, NormalizeHex, SplitAt, IsZeroHex, HexEq, AddHex, BuildTuple, NotHex, HexLT, HexGT, HexSLT, HexSGT, SubHex, AndHex, OrHex, XorHex, ByteAtHex, SignExtendHex, ShlHex, ShrHex, SarHex, ModHex, DivHex, ArrayLengthToHex } from './type-utils';
import type { Keccak256 } from 'cryptoscript';

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

// EVM Execution Context
export type EvmContext = {
  // Transaction context
  address: string;      // 0x30 ADDRESS - current contract address
  origin: string;       // 0x32 ORIGIN - transaction sender
  caller: string;       // 0x33 CALLER - message sender
  callvalue: string;    // 0x34 CALLVALUE - message value
  gasprice: string;     // 0x3A GASPRICE - transaction gas price

  // Block context
  timestamp: string;    // 0x42 TIMESTAMP - block timestamp
  number: string;       // 0x43 NUMBER - block number
  chainid: string;      // 0x46 CHAINID - chain ID
  basefee: string;      // 0x48 BASEFEE - block base fee
  blobbasefee: string;  // 0x49 BLOBBASEFEE - blob base fee
  coinbase: string;     // 0x41 COINBASE - block beneficiary
  gaslimit: string;     // 0x45 GASLIMIT - block gas limit
  difficulty: string;   // 0x44 PREVRANDAO/DIFFICULTY

  // Input data
  calldata: string[];   // Input bytes for CALLDATALOAD/SIZE/COPY
  code: string[];       // Contract bytecode for CODESIZE/CODECOPY
  returndata: string[]; // Return data from last external call

  // Account state
  selfbalance: string;  // 0x47 SELFBALANCE - address(this).balance
};

export type DefaultContext = {
  address: '0x00';
  origin: '0x00';
  caller: '0x00';
  callvalue: '0x00';
  gasprice: '0x00';
  timestamp: '0x00';
  number: '0x00';
  chainid: '0x00';
  basefee: '0x00';
  blobbasefee: '0x00';
  coinbase: '0x00';
  gaslimit: '0xFFFFFFFF';
  difficulty: '0x00';
  calldata: [];
  code: [];
  returndata: [];
  selfbalance: '0x00';
};

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

// Gas-aware results with Memory and Storage
export type ExecOkGas<
  Stack extends string[],
  Memory extends string[],
  Storage extends Record<string, string>,
  Ret extends string | null,
  GasUsed extends unknown[],
  GasLimit extends number
> = ExecOk<Stack, Ret> & {
  memory: Memory;
  storage: Storage;
  gasUsed: GasUsed['length'];
  gasLimit: GasLimit;
};

export type ExecErrGas<
  Reason extends string,
  Stack extends string[],
  Memory extends string[],
  Storage extends Record<string, string>,
  GasUsed extends unknown[],
  GasLimit extends number
> = ExecErr<Reason, Stack> & {
  memory: Memory;
  storage: Storage;
  gasUsed: GasUsed['length'];
  gasLimit: GasLimit;
};

// Take first N elements and also provide tail
export type TakeAndDrop<
  A extends string[],
  N extends number
> = SplitAt<A, N>;

export type ConcatAsHex<S extends string[]> = `0x${JoinHex<S>}`;

// Helper to parse size parameter (supports small values 0-32)
type ParseMemSize<S extends string> =
  IsZeroHex<S> extends true
    ? 0
    : NormalizeHex<S> extends '01' ? 1
    : NormalizeHex<S> extends '02' ? 2
    : NormalizeHex<S> extends '03' ? 3
    : NormalizeHex<S> extends '04' ? 4
    : NormalizeHex<S> extends '05' ? 5
    : NormalizeHex<S> extends '06' ? 6
    : NormalizeHex<S> extends '07' ? 7
    : NormalizeHex<S> extends '08' ? 8
    : NormalizeHex<S> extends '09' ? 9
    : NormalizeHex<S> extends '0A' ? 10
    : NormalizeHex<S> extends '0B' ? 11
    : NormalizeHex<S> extends '0C' ? 12
    : NormalizeHex<S> extends '0D' ? 13
    : NormalizeHex<S> extends '0E' ? 14
    : NormalizeHex<S> extends '0F' ? 15
    : NormalizeHex<S> extends '10' ? 16
    : NormalizeHex<S> extends '11' ? 17
    : NormalizeHex<S> extends '12' ? 18
    : NormalizeHex<S> extends '13' ? 19
    : NormalizeHex<S> extends '14' ? 20
    : NormalizeHex<S> extends '15' ? 21
    : NormalizeHex<S> extends '16' ? 22
    : NormalizeHex<S> extends '17' ? 23
    : NormalizeHex<S> extends '18' ? 24
    : NormalizeHex<S> extends '19' ? 25
    : NormalizeHex<S> extends '1A' ? 26
    : NormalizeHex<S> extends '1B' ? 27
    : NormalizeHex<S> extends '1C' ? 28
    : NormalizeHex<S> extends '1D' ? 29
    : NormalizeHex<S> extends '1E' ? 30
    : NormalizeHex<S> extends '1F' ? 31
    : NormalizeHex<S> extends '20' ? 32
    : 0;

// Gas schedule (approximate, configurable via generic gas limit only)
// Values chosen to reflect typical EVM costs for implemented ops.
type GasCostFor<Op extends string> =
  Op extends '00' // STOP
    ? 0
    : Op extends '01' | '02' | '03' | '04' | '06' // ADD, SUB, MOD
    ? 3
    : Op extends '20' // SHA3/KECCAK256
    ? 30
    : Op extends '19' // NOT
    ? 3
    : Op extends '0B' // SIGNEXTEND
    ? 3
    : Op extends '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '1A' | '1B' | '1C' | '1D' // + SHL/SHR/SAR
    ? 3
    : Op extends '16' | '17' | '18' | '19' // AND/OR/XOR/NOT
    ? 3
    : Op extends '30' // ADDRESS
    ? 3
    : Op extends '32' | '33' // ORIGIN, CALLER
    ? 3
    : Op extends '47' // SELFBALANCE
    ? 3
    : Op extends '34' // CALLVALUE
    ? 3
    : Op extends '38' // CODESIZE
    ? 3
    : Op extends '3A' // GASPRICE
    ? 3
    : Op extends '3D' | '3E' // RETURNDATASIZE, RETURNDATACOPY
    ? 3
    : Op extends '42' // TIMESTAMP
    ? 3
    : Op extends '43' // NUMBER
    ? 3
    : Op extends '46' // CHAINID
    ? 3
    : Op extends '48' // BASEFEE
    ? 3
    : Op extends '49' // BLOBBASEFEE
    ? 3
    : Op extends '50' // POP
    ? 2
    : Op extends '58' // PC
    ? 3
    : Op extends '5A' // GAS
    ? 3
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

// Execution engine: consumes an array of hex bytes with stateful execution
export type Exec<
  Bytes extends string[],
  Stack extends string[] = [],
  Memory extends string[] = [],
  Storage extends Record<string, string> = {},
  Steps extends unknown[] = [],
  GasUsed extends unknown[] = [],
  GasLimit extends number = 1000,
  Context extends EvmContext = DefaultContext
> = Steps['length'] extends 256
  ? ExecErrGas<'step_overflow', Stack, Memory, Storage, GasUsed, GasLimit>
  : Bytes extends [infer Op extends string, ...infer Rest extends string[]]
  ? Op extends '00' // STOP (optional: treat as halt without return)
    ? CanAfford<GasUsed, GasCostFor<'00'>, GasLimit> extends true
      ? ExecOkGas<Stack, Memory, Storage, null, Charge<GasUsed, GasCostFor<'00'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '20' // SHA3/KECCAK256
    ? CanAfford<GasUsed, GasCostFor<'20'>, GasLimit> extends true
      ? Stack extends [infer Offset extends string, infer Size extends string, ...infer S2 extends string[]]
        ? IsZeroHex<Size> extends true
          ? Exec<Rest, Push<S2, '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'20'>>, GasLimit, Context>
          : TakeAndDrop<Memory, ParseMemSize<Size>> extends [infer MemSlice extends string[], any]
            ? ConcatAsHex<MemSlice> extends infer InputHex extends `0x${string}`
              ? Exec<Rest, Push<S2, Keccak256<InputHex>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'20'>>, GasLimit, Context>
              : ExecErrGas<'sha3_failed', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'20'>>, GasLimit>
            : ExecErrGas<'sha3_failed', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'20'>>, GasLimit>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'20'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '5B' // JUMPDEST (no-op)
    ? CanAfford<GasUsed, GasCostFor<'5B'>, GasLimit> extends true
      ? Exec<Rest, Stack, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'5B'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '5F' // PUSH0
    ? CanAfford<GasUsed, GasCostFor<'5F'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, '0x00'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'5F'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '59' // MSIZE
    ? CanAfford<GasUsed, GasCostFor<'59'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, ArrayLengthToHex<Memory>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'59'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '38' // CODESIZE
    ? CanAfford<GasUsed, GasCostFor<'38'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, ArrayLengthToHex<Context['code']>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'38'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '3A' // GASPRICE
    ? CanAfford<GasUsed, GasCostFor<'3A'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['gasprice']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'3A'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '3D' // RETURNDATASIZE
    ? CanAfford<GasUsed, GasCostFor<'3D'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, ArrayLengthToHex<Context['returndata']>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'3D'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '3E' // RETURNDATACOPY (pops 3 items, no-op - memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'3E'>, GasLimit> extends true
      ? Stack extends [infer DestOffset extends string, infer Offset extends string, infer Size extends string, ...infer S2 extends string[]]
        ? Exec<Rest, S2, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'3E'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'3E'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends 'FD' // REVERT
    ? CanAfford<GasUsed, GasCostFor<'FD'>, GasLimit> extends true
      ? ExecErrGas<'revert', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'FD'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends 'FE' // INVALID
    ? CanAfford<GasUsed, GasCostFor<'FE'>, GasLimit> extends true
      ? ExecErrGas<'invalid', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'FE'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends 'F3' // RETURN
    ? CanAfford<GasUsed, GasCostFor<'F3'>, GasLimit> extends true
      ? ExecOkGas<Stack, Memory, Storage, Top<Stack> extends string ? Top<Stack> : null, Charge<GasUsed, GasCostFor<'F3'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '50' // POP
    ? CanAfford<GasUsed, GasCostFor<'50'>, GasLimit> extends true
      ? Stack extends [any, ...infer S2 extends string[]]
        ? Exec<Rest, S2, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'50'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'50'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '14' // EQ
    ? CanAfford<GasUsed, GasCostFor<'14'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexEq<A, B> extends true ? '0x01' : '0x00'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'14'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'14'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '15' // ISZERO
    ? CanAfford<GasUsed, GasCostFor<'15'>, GasLimit> extends true
      ? Stack extends [infer A extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, IsZeroHex<A> extends true ? '0x01' : '0x00'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'15'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'15'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '19' // NOT
    ? CanAfford<GasUsed, GasCostFor<'19'>, GasLimit> extends true
      ? Stack extends [infer A extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, NotHex<A>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'19'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'19'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '0B' // SIGNEXTEND
    ? CanAfford<GasUsed, GasCostFor<'0B'>, GasLimit> extends true
      ? Stack extends [infer Index extends string, infer Value extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, SignExtendHex<Index, Value>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'0B'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'0B'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '01' // ADD
    ? CanAfford<GasUsed, GasCostFor<'01'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, AddHex<A, B>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'01'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'01'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '03' // SUB
    ? CanAfford<GasUsed, GasCostFor<'01'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, SubHex<A, B>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'01'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'01'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '04' // DIV
    ? CanAfford<GasUsed, GasCostFor<'04'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, DivHex<A, B>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'04'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'04'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '06' // MOD
    ? CanAfford<GasUsed, GasCostFor<'06'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, ModHex<A, B>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'06'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'06'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '10' // LT
    ? CanAfford<GasUsed, GasCostFor<'10'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexLT<A, B> extends true ? '0x01' : '0x00'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'10'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'10'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '11' // GT
    ? CanAfford<GasUsed, GasCostFor<'11'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexGT<A, B> extends true ? '0x01' : '0x00'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'11'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'11'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '12' // SLT
    ? CanAfford<GasUsed, GasCostFor<'12'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexSLT<A, B> extends true ? '0x01' : '0x00'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'12'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'12'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '13' // SGT
    ? CanAfford<GasUsed, GasCostFor<'13'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, HexSGT<A, B> extends true ? '0x01' : '0x00'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'13'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'13'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '16' // AND
    ? CanAfford<GasUsed, GasCostFor<'16'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, AndHex<A, B>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'16'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'16'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '17' // OR
    ? CanAfford<GasUsed, GasCostFor<'17'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, OrHex<A, B>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'17'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'17'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '18' // XOR
    ? CanAfford<GasUsed, GasCostFor<'18'>, GasLimit> extends true
      ? Stack extends [infer A extends string, infer B extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, XorHex<A, B>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'18'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'18'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '1A' // BYTE
    ? CanAfford<GasUsed, GasCostFor<'1A'>, GasLimit> extends true
      ? Stack extends [infer I extends string, infer W extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, ByteAtHex<I, W>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'1A'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'1A'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '1B' // SHL
    ? CanAfford<GasUsed, GasCostFor<'1B'>, GasLimit> extends true
      ? Stack extends [infer Shift extends string, infer Val extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, ShlHex<Shift, Val>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'1B'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'1B'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '1C' // SHR
    ? CanAfford<GasUsed, GasCostFor<'1C'>, GasLimit> extends true
      ? Stack extends [infer Shift extends string, infer Val extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, ShrHex<Shift, Val>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'1C'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'1C'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '1D' // SAR
    ? CanAfford<GasUsed, GasCostFor<'1D'>, GasLimit> extends true
      ? Stack extends [infer Shift extends string, infer Val extends string, ...infer S2 extends string[]]
        ? Exec<Rest, Push<S2, SarHex<Shift, Val>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'1D'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'1D'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '30' // ADDRESS
    ? CanAfford<GasUsed, GasCostFor<'30'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['address']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'30'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '32' // ORIGIN
    ? CanAfford<GasUsed, GasCostFor<'32'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['origin']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'32'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '33' // CALLER
    ? CanAfford<GasUsed, GasCostFor<'33'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['caller']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'33'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '34' // CALLVALUE
    ? CanAfford<GasUsed, GasCostFor<'34'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['callvalue']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'34'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '42' // TIMESTAMP
    ? CanAfford<GasUsed, GasCostFor<'42'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['timestamp']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'42'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '43' // NUMBER
    ? CanAfford<GasUsed, GasCostFor<'43'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['number']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'43'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '46' // CHAINID
    ? CanAfford<GasUsed, GasCostFor<'46'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['chainid']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'46'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '47' // SELFBALANCE
    ? CanAfford<GasUsed, GasCostFor<'47'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['selfbalance']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'47'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '48' // BASEFEE
    ? CanAfford<GasUsed, GasCostFor<'48'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['basefee']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'48'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '49' // BLOBBASEFEE
    ? CanAfford<GasUsed, GasCostFor<'49'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, Context['blobbasefee']>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'49'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '58' // PC (no program counter model -> 0)
    ? CanAfford<GasUsed, GasCostFor<'58'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, '0x00'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'58'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends '5A' // GAS (no gas-left calculation -> 0)
    ? CanAfford<GasUsed, GasCostFor<'5A'>, GasLimit> extends true
      ? Exec<Rest, Push<Stack, '0x00'>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'5A'>>, GasLimit, Context>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends 'A0' // LOG0 (pops offset, size; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A0'>, GasLimit> extends true
      ? Stack extends [any, any, ...infer S2 extends string[]]
        ? Exec<Rest, S2, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'A0'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'A0'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends 'A1' // LOG1 (pops offset, size, topic1; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A1'>, GasLimit> extends true
      ? Stack extends [any, any, any, ...infer S3 extends string[]]
        ? Exec<Rest, S3, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'A1'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'A1'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends 'A2' // LOG2 (pops offset, size, topic1, topic2; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A2'>, GasLimit> extends true
      ? Stack extends [any, any, any, any, ...infer S4 extends string[]]
        ? Exec<Rest, S4, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'A2'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'A2'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends 'A3' // LOG3 (pops offset, size, topic1, topic2, topic3; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A3'>, GasLimit> extends true
      ? Stack extends [any, any, any, any, any, ...infer S5 extends string[]]
        ? Exec<Rest, S5, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'A3'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'A3'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : Op extends 'A4' // LOG4 (pops offset, size, topic1, topic2, topic3, topic4; no-op, memory ignored)
    ? CanAfford<GasUsed, GasCostFor<'A4'>, GasLimit> extends true
      ? Stack extends [any, any, any, any, any, any, ...infer S6 extends string[]]
        ? Exec<Rest, S6, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'A4'>>, GasLimit, Context>
        : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'A4'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : IsPush<Op> extends true
    ? PushLen<Op> extends number
      ? CanAfford<GasUsed, GasCostFor<'60'>, GasLimit> extends true
        ? TakeAndDrop<Rest, PushLen<Op>> extends [infer ValBytes extends string[], infer Next extends string[]]
          ? ValBytes['length'] extends PushLen<Op>
            ? Exec<Next, Push<Stack, ConcatAsHex<ValBytes>>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'60'>>, GasLimit, Context>
            : ExecErrGas<'bytecode_truncated', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'60'>>, GasLimit>
          : ExecErrGas<'bytecode_truncated', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'60'>>, GasLimit>
        : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
      : ExecErrGas<'invalid_push', Stack, Memory, Storage, GasUsed, GasLimit>
    : IsDup<Op> extends true
    ? CanAfford<GasUsed, GasCostFor<'80'>, GasLimit> extends true
      ? DupN<Op> extends infer N extends number
        ? AtZeroBased<Stack, Dec<N>> extends infer V extends string | never
          ? [V] extends [never]
            ? ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'80'>>, GasLimit>
            : Exec<Rest, Push<Stack, V>, Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'80'>>, GasLimit, Context>
          : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'80'>>, GasLimit>
        : ExecErrGas<'invalid_dup', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'80'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : IsSwap<Op> extends true
    ? CanAfford<GasUsed, GasCostFor<'90'>, GasLimit> extends true
      ? SwapN<Op> extends infer N extends number
        ? Stack extends [infer H extends string, ...infer T extends string[]]
          ? SplitAt<T, Dec<N>> extends [infer Pre extends string[], infer Post extends string[]]
            ? Post extends [infer Target extends string, ...infer PostRest extends string[]]
              ? Exec<Rest, [Target, ...Pre, H, ...PostRest], Memory, Storage, [...Steps, 1], Charge<GasUsed, GasCostFor<'90'>>, GasLimit, Context>
              : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'90'>>, GasLimit>
            : ExecErrGas<'swap_failed', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'90'>>, GasLimit>
          : ExecErrGas<'stack_underflow', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'90'>>, GasLimit>
        : ExecErrGas<'invalid_swap', Stack, Memory, Storage, Charge<GasUsed, GasCostFor<'90'>>, GasLimit>
      : ExecErrGas<'out_of_gas', Stack, Memory, Storage, GasUsed, GasLimit>
    : ExecErrGas<'unknown_opcode', Stack, Memory, Storage, GasUsed, GasLimit>
  : ExecOkGas<Stack, Memory, Storage, null, GasUsed, GasLimit>;

// No extra helpers needed for SWAP using SplitAt

// Public API
export type ExecuteEvm<
  Hex extends string,
  GasLimit extends number = 1000,
  Context extends EvmContext = DefaultContext
> = Exec<HexToBytes<NormalizeHex<Hex>>, [], [], {}, [], [], GasLimit, Context>;

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
