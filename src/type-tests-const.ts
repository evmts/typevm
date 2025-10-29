import type { Expect, Equal } from './type-utils';
import type { ExecuteEvm } from './evm-types';

// PUSH + RETURN
export const BC1 = '0x6001F3' as const; // PUSH1 01; RETURN
export type R1 = ExecuteEvm<typeof BC1>; 
export type T_const_1_status = Expect<Equal<R1['status'], 'ok'>>;
export type T_const_1_ret = Expect<Equal<R1['returnData'], '0x01'>>;

// PUSH, PUSH, SWAP1, RETURN -> top becomes first pushed
export const BC2 = '0x6001600290F3' as const;
export type R2 = ExecuteEvm<typeof BC2>;
export type T_const_2_ret = Expect<Equal<R2['returnData'], '0x01'>>;

// DUP1 returns the duplicated value
export const BC3 = '0x60AA80F3' as const; // PUSH1 AA; DUP1; RETURN
export type R3 = ExecuteEvm<typeof BC3>;
export type T_const_3_ret = Expect<Equal<R3['returnData'], '0xAA'>>;

// POP underflow -> error
export const BC4 = '0x50F3' as const; // POP; RETURN
export type R4 = ExecuteEvm<typeof BC4>;
export type T_const_4_status = Expect<Equal<R4['status'], 'error'>>;

// EQ: 1 == 1 -> 1; 1 == 2 -> 0
export const BC5 = '0x6001600114F3' as const;
export const BC6 = '0x6001600214F3' as const;
export type R5 = ExecuteEvm<typeof BC5>;
export type R6 = ExecuteEvm<typeof BC6>;
export type T_const_5_ret = Expect<Equal<R5['returnData'], '0x01'>>;
export type T_const_6_ret = Expect<Equal<R6['returnData'], '0x00'>>;

// ISZERO: 0 -> 1, 1 -> 0
export const BC7 = '0x600015F3' as const; // push 0; iszero; return
export const BC8 = '0x600115F3' as const; // push 1; iszero; return
export type R7 = ExecuteEvm<typeof BC7>;
export type R8 = ExecuteEvm<typeof BC8>;
export type T_const_7_ret = Expect<Equal<R7['returnData'], '0x01'>>;
export type T_const_8_ret = Expect<Equal<R8['returnData'], '0x00'>>;

// PUSH0 + RETURN
export const BC9 = '0x5FF3' as const;
export type R9 = ExecuteEvm<typeof BC9>;
export type T_const_9_ret = Expect<Equal<R9['returnData'], '0x00'>>;

// JUMPDEST no-op
export const BC10 = '0x5B6001F3' as const;
export type R10 = ExecuteEvm<typeof BC10>;
export type T_const_10_ret = Expect<Equal<R10['returnData'], '0x01'>>;

// REVERT and INVALID errors
export const BC11 = '0xFDF3' as const;
export const BC12 = '0xFEF3' as const;
export type R11 = ExecuteEvm<typeof BC11>;
export type R12 = ExecuteEvm<typeof BC12>;
export type T_const_11_status = Expect<Equal<R11['status'], 'error'>>;
export type T_const_11_reason = Expect<Equal<R11['reason'], 'revert'>>;
export type T_const_12_status = Expect<Equal<R12['status'], 'error'>>;
export type T_const_12_reason = Expect<Equal<R12['reason'], 'invalid'>>;

// Truncated PUSH (PUSH2 but only one byte provided) -> error
export const BC13 = '0x61F3' as const; // PUSH2 <missing 2 bytes>
export type R13 = ExecuteEvm<typeof BC13>;
export type T_const_13_status = Expect<Equal<R13['status'], 'error'>>;

// LT and GT
export const BC14 = '0x6001600210F3' as const; // 1 < 2 -> 0 (false)
export const BC15 = '0x6002600110F3' as const; // 1 < 2 -> 1
export const BC16 = '0x6002600111F3' as const; // 1 > 2 -> 0
export const BC17 = '0x6001600211F3' as const; // 2 > 1 -> 1
export type R14 = ExecuteEvm<typeof BC14>;
export type R15 = ExecuteEvm<typeof BC15>;
export type R16 = ExecuteEvm<typeof BC16>;
export type R17 = ExecuteEvm<typeof BC17>;
export type T_const_14_ret = Expect<Equal<R14['returnData'], '0x00'>>;
export type T_const_15_ret = Expect<Equal<R15['returnData'], '0x01'>>;
export type T_const_16b_ret = Expect<Equal<R16['returnData'], '0x00'>>;
export type T_const_17b_ret = Expect<Equal<R17['returnData'], '0x01'>>;

// (Further opcode tests added incrementally in other files)
// Sanity: NOT, AND, OR, XOR, BYTE produce ok status
export const BCS1 = '0x600019F3' as const; // NOT 0
export type RS1 = ExecuteEvm<typeof BCS1>;
export type T_sanity_1 = Expect<Equal<RS1['status'], 'ok'>>;

export const BCS2 = '0x60F0600F16F3' as const; // AND
export type RS2 = ExecuteEvm<typeof BCS2>;
export type T_sanity_2 = Expect<Equal<RS2['status'], 'ok'>>;

export const BCS3 = '0x60F0600F17F3' as const; // OR
export type RS3 = ExecuteEvm<typeof BCS3>;
export type T_sanity_3 = Expect<Equal<RS3['status'], 'ok'>>;

export const BCS4 = '0x60F0600F18F3' as const; // XOR
export type RS4 = ExecuteEvm<typeof BCS4>;
export type T_sanity_4 = Expect<Equal<RS4['status'], 'ok'>>;

export const BCS5 = '0x7F00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFFF360001AF3' as const; // BYTE 0
export type RS5 = ExecuteEvm<typeof BCS5>;
export type T_sanity_5 = Expect<Equal<RS5['status'], 'ok'>>;

// SIGNEXTEND basic cases
export const BCS6 = '0x600060800BF3' as const; // signextend(0, 0x80) -> ...FF80
export type RS6 = ExecuteEvm<typeof BCS6>;
export type T_sanity_6 = Expect<Equal<RS6['status'], 'ok'>>;


// AND/OR/XOR basic cases
// SHL/SHR/SAR small checks
export const BCS7 = '0x600160041BF3' as const; // 0x01 << 4 -> 0x10
export type RS7 = ExecuteEvm<typeof BCS7>;
export type T_sanity_7 = Expect<Equal<RS7['status'], 'ok'>>;


export const BCS9 = '0x60F060041CF3' as const; // 0xF0 >> 4 -> 0x0F
export type RS9 = ExecuteEvm<typeof BCS9>;
export type T_sanity_9 = Expect<Equal<RS9['status'], 'ok'>>;

export const BCS10 = '0x60F060041DF3' as const; // SAR 4 of 0xF0 -> 0x0F
export type RS10 = ExecuteEvm<typeof BCS10>;
export type T_sanity_10 = Expect<Equal<RS10['status'], 'ok'>>;
