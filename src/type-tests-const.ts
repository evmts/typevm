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

// PC (0x58) stub: returns 0x00
export const BCS11 = '0x58F3' as const; // PC; RETURN
export type RS11 = ExecuteEvm<typeof BCS11>;
export type T_sanity_11_status = Expect<Equal<RS11['status'], 'ok'>>;
export type T_sanity_11_ret = Expect<Equal<RS11['returnData'], '0x00'>>;

// RETURNDATASIZE (0x3D) - returns 0 (no external call context)
export const BC_RETURNDATASIZE_1 = '0x3DF3' as const; // RETURNDATASIZE; RETURN
export type R_RETURNDATASIZE_1 = ExecuteEvm<typeof BC_RETURNDATASIZE_1>;
export type T_returndatasize_1_status = Expect<Equal<R_RETURNDATASIZE_1['status'], 'ok'>>;
export type T_returndatasize_1_ret = Expect<Equal<R_RETURNDATASIZE_1['returnData'], '0x00'>>;

// RETURNDATASIZE basic return test
export const BC_RETURNDATASIZE_2 = '0x3D3DF3' as const; // RETURNDATASIZE; RETURNDATASIZE; RETURN
export type R_RETURNDATASIZE_2 = ExecuteEvm<typeof BC_RETURNDATASIZE_2>;
export type T_returndatasize_2_status = Expect<Equal<R_RETURNDATASIZE_2['status'], 'ok'>>;
export type T_returndatasize_2_ret = Expect<Equal<R_RETURNDATASIZE_2['returnData'], '0x00'>>;

// RETURNDATACOPY (0x3E) - pops 3 items (destOffset, offset, size), continues execution (no-op)
// Sanity: status 'ok' when stack has 3+ items
export const BC_RETURNDATACOPY_1 = '0x600160026003600460053EF3' as const; // PUSH1 01; PUSH1 02; PUSH1 03; PUSH1 04; PUSH1 05; RETURNDATACOPY; RETURN
export type R_RETURNDATACOPY_1 = ExecuteEvm<typeof BC_RETURNDATACOPY_1>;
export type T_returndatacopy_1_status = Expect<Equal<R_RETURNDATACOPY_1['status'], 'ok'>>;
export type T_returndatacopy_1_ret = Expect<Equal<R_RETURNDATACOPY_1['returnData'], '0x02'>>;

// Error: status 'error' reason 'stack_underflow' with <3 items
export const BC_RETURNDATACOPY_2 = '0x600160023EF3' as const; // PUSH1 01; PUSH1 02; RETURNDATACOPY; RETURN (only 2 items)
export type R_RETURNDATACOPY_2 = ExecuteEvm<typeof BC_RETURNDATACOPY_2>;
export type T_returndatacopy_2_status = Expect<Equal<R_RETURNDATACOPY_2['status'], 'error'>>;
export type T_returndatacopy_2_reason = Expect<Equal<R_RETURNDATACOPY_2['reason'], 'stack_underflow'>>;

// LOG2 (0xA2) - pops 4 items (offset, size, topic1, topic2), continues execution
// Sanity: status 'ok' when stack has 4+ items
export const BC_LOG2_1 = '0x60016002600360046001A2F3' as const; // PUSH1 01; PUSH1 02; PUSH1 03; PUSH1 04; PUSH1 01; LOG2; RETURN
export type R_LOG2_1 = ExecuteEvm<typeof BC_LOG2_1>;
export type T_log2_1_status = Expect<Equal<R_LOG2_1['status'], 'ok'>>;
export type T_log2_1_ret = Expect<Equal<R_LOG2_1['returnData'], '0x01'>>;

// Error: status 'error' reason 'stack_underflow' with <4 items
export const BC_LOG2_2 = '0x600160026003A2F3' as const; // PUSH1 01; PUSH1 02; PUSH1 03; LOG2; RETURN (only 3 items)
export type R_LOG2_2 = ExecuteEvm<typeof BC_LOG2_2>;
export type T_log2_2_status = Expect<Equal<R_LOG2_2['status'], 'error'>>;
export type T_log2_2_reason = Expect<Equal<R_LOG2_2['reason'], 'stack_underflow'>>;

// LOG3 (0xA3) - pops 5 items (offset, size, topic1, topic2, topic3), continues execution
// Sanity: status 'ok' when stack has 5+ items
export const BC_LOG3_1 = '0x600160026003600460056009600AA3F3' as const; // PUSH1 01; PUSH1 02; PUSH1 03; PUSH1 04; PUSH1 05; PUSH1 09; PUSH1 0A; LOG3; RETURN
export type R_LOG3_1 = ExecuteEvm<typeof BC_LOG3_1>;
export type T_log3_1_status = Expect<Equal<R_LOG3_1['status'], 'ok'>>;
export type T_log3_1_ret = Expect<Equal<R_LOG3_1['returnData'], '0x02'>>;

// Error: status 'error' reason 'stack_underflow' with <5 items
export const BC_LOG3_2 = '0x6001600260036004A3F3' as const; // PUSH1 01; PUSH1 02; PUSH1 03; PUSH1 04; LOG3; RETURN (only 4 items, need 5)
export type R_LOG3_2 = ExecuteEvm<typeof BC_LOG3_2>;
export type T_log3_2_status = Expect<Equal<R_LOG3_2['status'], 'error'>>;
export type T_log3_2_reason = Expect<Equal<R_LOG3_2['reason'], 'stack_underflow'>>;

// LOG4 (0xA4) - pops 6 items (offset, size, topic1, topic2, topic3, topic4), continues execution
// Sanity: status 'ok' when stack has 6+ items
export const BC_LOG4_1 = '0x60016002600360046005600660076008A4F3' as const; // PUSH1 01; PUSH1 02; PUSH1 03; PUSH1 04; PUSH1 05; PUSH1 06; PUSH1 07; PUSH1 08; LOG4; RETURN
export type R_LOG4_1 = ExecuteEvm<typeof BC_LOG4_1>;
export type T_log4_1_status = Expect<Equal<R_LOG4_1['status'], 'ok'>>;
export type T_log4_1_ret = Expect<Equal<R_LOG4_1['returnData'], '0x02'>>;

// Error: status 'error' reason 'stack_underflow' with <6 items
export const BC_LOG4_2 = '0x60016002600360046005A4F3' as const; // PUSH1 01; PUSH1 02; PUSH1 03; PUSH1 04; PUSH1 05; LOG4; RETURN (only 5 items)
export type R_LOG4_2 = ExecuteEvm<typeof BC_LOG4_2>;
export type T_log4_2_status = Expect<Equal<R_LOG4_2['status'], 'error'>>;
export type T_log4_2_reason = Expect<Equal<R_LOG4_2['reason'], 'stack_underflow'>>;

// LOG0 (0xA0) - pops 2 items (offset, size), continues execution
// Sanity: status 'ok' when stack has 2+ items
export const BC_LOG0_1 = '0x600160026003A0F3' as const; // PUSH1 01; PUSH1 02; PUSH1 03; LOG0; RETURN
export type R_LOG0_1 = ExecuteEvm<typeof BC_LOG0_1>;
export type T_log0_1_status = Expect<Equal<R_LOG0_1['status'], 'ok'>>;
export type T_log0_1_ret = Expect<Equal<R_LOG0_1['returnData'], '0x01'>>;

// Error: status 'error' reason 'stack_underflow' with <2 items
export const BC_LOG0_2 = '0x6001A0F3' as const; // PUSH1 01; LOG0; RETURN (only 1 item)
export type R_LOG0_2 = ExecuteEvm<typeof BC_LOG0_2>;
export type T_log0_2_status = Expect<Equal<R_LOG0_2['status'], 'error'>>;
export type T_log0_2_reason = Expect<Equal<R_LOG0_2['reason'], 'stack_underflow'>>;

// LOG1 (0xA1) - pops 3 items (offset, size, topic), continues execution
// Sanity: status 'ok' when stack has 3+ items
export const BC_LOG1_1 = '0x600160026003600460056001A1F3' as const; // PUSH1 01; PUSH1 02; PUSH1 03; PUSH1 04; PUSH1 05; PUSH1 01; LOG1; RETURN
export type R_LOG1_1 = ExecuteEvm<typeof BC_LOG1_1>;
export type T_log1_1_status = Expect<Equal<R_LOG1_1['status'], 'ok'>>;
export type T_log1_1_ret = Expect<Equal<R_LOG1_1['returnData'], '0x03'>>;

// Error: status 'error' reason 'stack_underflow' with <3 items
export const BC_LOG1_2 = '0x60016002A1F3' as const; // PUSH1 01; PUSH1 02; LOG1; RETURN (only 2 items)
export type R_LOG1_2 = ExecuteEvm<typeof BC_LOG1_2>;
export type T_log1_2_status = Expect<Equal<R_LOG1_2['status'], 'error'>>;
export type T_log1_2_reason = Expect<Equal<R_LOG1_2['reason'], 'stack_underflow'>>;

// CHAINID (0x46) - returns 0 (no chain context stub)
export const BC_CHAINID_1 = '0x46F3' as const; // CHAINID; RETURN
export type R_CHAINID_1 = ExecuteEvm<typeof BC_CHAINID_1>;
export type T_chainid_1_status = Expect<Equal<R_CHAINID_1['status'], 'ok'>>;
export type T_chainid_1_ret = Expect<Equal<R_CHAINID_1['returnData'], '0x00'>>;

// NUMBER (0x43) - returns 0 (no block context stub)
export const BC_NUMBER_1 = '0x43F3' as const; // NUMBER; RETURN
export type R_NUMBER_1 = ExecuteEvm<typeof BC_NUMBER_1>;
export type T_number_1_status = Expect<Equal<R_NUMBER_1['status'], 'ok'>>;
export type T_number_1_ret = Expect<Equal<R_NUMBER_1['returnData'], '0x00'>>;

// CODESIZE (0x38) - returns 0 (no code model stub)
export const BC_CODESIZE_1 = '0x38F3' as const; // CODESIZE; RETURN
export type R_CODESIZE_1 = ExecuteEvm<typeof BC_CODESIZE_1>;
export type T_codesize_1_status = Expect<Equal<R_CODESIZE_1['status'], 'ok'>>;
export type T_codesize_1_ret = Expect<Equal<R_CODESIZE_1['returnData'], '0x00'>>;

// GASPRICE (0x3A) - returns 0 (no gas price model stub)
export const BC_GASPRICE_1 = '0x3AF3' as const; // GASPRICE; RETURN
export type R_GASPRICE_1 = ExecuteEvm<typeof BC_GASPRICE_1>;
export type T_gasprice_1_status = Expect<Equal<R_GASPRICE_1['status'], 'ok'>>;
export type T_gasprice_1_ret = Expect<Equal<R_GASPRICE_1['returnData'], '0x00'>>;

// BLOBBASEFEE (0x49) - returns 0 (no blob fee model stub)
export const BC_BLOBBASEFEE_1 = '0x49F3' as const; // BLOBBASEFEE; RETURN
export type R_BLOBBASEFEE_1 = ExecuteEvm<typeof BC_BLOBBASEFEE_1>;
export type T_blobbasefee_1_status = Expect<Equal<R_BLOBBASEFEE_1['status'], 'ok'>>;
export type T_blobbasefee_1_ret = Expect<Equal<R_BLOBBASEFEE_1['returnData'], '0x00'>>;
