# TypeVM

A TypeScript type-level EVM (Ethereum Virtual Machine) interpreter. Execute EVM bytecode entirely at compile time using TypeScript's type system!

## What is this?

TypeVM is an experimental EVM bytecode interpreter implemented entirely in TypeScript's type system. It parses and executes EVM bytecode at compile-time, returning results as TypeScript types. No runtime code execution - just pure type-level computation.

## Features

- ✅ Type-level bytecode parsing and execution
- ✅ Stack operations (PUSH, POP, DUP, SWAP)
- ✅ Arithmetic and logic (ADD, EQ, ISZERO)
- ✅ Control flow opcodes (STOP, RETURN, REVERT, INVALID, JUMPDEST)
- ✅ Compile-time error detection (stack underflow, invalid opcodes, etc.)
- ✅ Step limit protection (256 steps max)
- ✅ Gas metering with configurable limit

## Example

```typescript
import type { ExecuteEvm } from 'typescript-evm';

// Execute: PUSH1 0x42, RETURN
// This pushes 0x42 onto the stack and returns it
type Result1 = ExecuteEvm<'0x6042F3'>;
// Result1 = {
//   status: 'ok';
//   stack: ['0x42'];
//   returnData: '0x42';
// }

// Execute: PUSH1 0x01, PUSH1 0x01, EQ, RETURN
// Pushes 1 twice, compares for equality, returns result
type Result2 = ExecuteEvm<'0x600160011415F3'>;
// Result2 = {
//   status: 'ok';
//   stack: ['0x01'];
//   returnData: '0x01';  // true (1 == 1)
// }

// Execute: PUSH1 0x01, PUSH1 0x02, SWAP1, POP, RETURN
// Demonstrates stack manipulation
type Result3 = ExecuteEvm<'0x600160029050F3'>;
// Result3 = {
//   status: 'ok';
//   returnData: '0x02';
// }

// Stack underflow error
type Result4 = ExecuteEvm<'0x50F3'>;  // POP on empty stack, then RETURN
// Result4 = {
//   status: 'error';
//   reason: 'stack_underflow';
//   stack: [];
// }

// ISZERO example
type Result5 = ExecuteEvm<'0x600015F3'>;  // PUSH1 0x00, ISZERO, RETURN
// Result5 = {
//   status: 'ok';
//   returnData: '0x01';  // true (0 is zero)
// }
```

## Supported Opcodes

### Stack Operations
- `0x50` - **POP**: Remove top item from stack
- `0x5F` - **PUSH0**: Push 0x00 onto stack
- `0x60-0x7F` - **PUSH1-PUSH32**: Push N bytes onto stack
- `0x80-0x8F` - **DUP1-DUP16**: Duplicate Nth stack item
- `0x90-0x9F` - **SWAP1-SWAP16**: Swap top with Nth stack item

### Arithmetic & Logic
- `0x01` - **ADD**: Add top two stack items
- `0x14` - **EQ**: Check equality of top two items
- `0x15` - **ISZERO**: Check if top item is zero

### Control Flow
- `0x00` - **STOP**: Halt execution
- `0x5B` - **JUMPDEST**: Jump destination (no-op)
- `0xF3` - **RETURN**: Return with top of stack as return data
- `0xFD` - **REVERT**: Revert execution
- `0xFE` - **INVALID**: Invalid opcode error

## Opcode Checklist

Comprehensive list of EVM opcodes with implementation status for TypeVM. Checked items are implemented at the type level today.

### Stop & Arithmetic (0x00–0x1F)
- [x] `0x00` STOP
- [x] `0x01` ADD
- [ ] `0x02` MUL
- [x] `0x03` SUB
- [ ] `0x04` DIV
- [ ] `0x05` SDIV
- [ ] `0x06` MOD
- [ ] `0x07` SMOD
- [ ] `0x08` ADDMOD
- [ ] `0x09` MULMOD
- [ ] `0x0A` EXP
- [x] `0x0B` SIGNEXTEND
- [x] `0x10` LT
- [x] `0x11` GT
- [x] `0x12` SLT
- [x] `0x13` SGT
- [x] `0x14` EQ
- [x] `0x15` ISZERO
- [x] `0x16` AND
- [x] `0x17` OR
- [x] `0x18` XOR
- [x] `0x19` NOT
- [x] `0x1A` BYTE
- [x] `0x1B` SHL
- [x] `0x1C` SHR
- [x] `0x1D` SAR

### SHA3 (0x20)
- [ ] `0x20` KECCAK256 (SHA3)

### Environment and Code (0x30–0x3F)
- [ ] `0x30` ADDRESS
- [ ] `0x31` BALANCE
- [ ] `0x32` ORIGIN
- [ ] `0x33` CALLER
- [ ] `0x34` CALLVALUE
- [ ] `0x35` CALLDATALOAD
- [ ] `0x36` CALLDATASIZE
- [ ] `0x37` CALLDATACOPY
- [ ] `0x38` CODESIZE
- [ ] `0x39` CODECOPY
- [ ] `0x3A` GASPRICE
- [ ] `0x3B` EXTCODESIZE
- [ ] `0x3C` EXTCODECOPY
- [ ] `0x3D` RETURNDATASIZE
- [ ] `0x3E` RETURNDATACOPY
- [ ] `0x3F` EXTCODEHASH

### Block Information (0x40–0x49)
- [ ] `0x40` BLOCKHASH
- [ ] `0x41` COINBASE
- [ ] `0x42` TIMESTAMP
- [ ] `0x43` NUMBER
- [ ] `0x44` PREVRANDAO (formerly DIFFICULTY)
- [ ] `0x45` GASLIMIT
- [ ] `0x46` CHAINID
- [ ] `0x47` SELFBALANCE
- [ ] `0x48` BASEFEE
- [ ] `0x49` BLOBBASEFEE

### Memory, Storage, and Flow (0x50–0x5F)
- [x] `0x50` POP
- [ ] `0x51` MLOAD
- [ ] `0x52` MSTORE
- [ ] `0x53` MSTORE8
- [ ] `0x54` SLOAD
- [ ] `0x55` SSTORE
- [ ] `0x56` JUMP
- [ ] `0x57` JUMPI
- [ ] `0x58` PC
- [x] `0x59` MSIZE
- [ ] `0x5A` GAS
- [x] `0x5B` JUMPDEST
- [ ] `0x5C` TLOAD
- [ ] `0x5D` TSTORE
- [ ] `0x5E` MCOPY
- [x] `0x5F` PUSH0

### Push Operations (0x60–0x7F)
- [x] `0x60–0x7F` PUSH1–PUSH32

### Duplication Operations (0x80–0x8F)
- [x] `0x80–0x8F` DUP1–DUP16

### Exchange Operations (0x90–0x9F)
- [x] `0x90–0x9F` SWAP1–SWAP16

### Logging (0xA0–0xA4)
- [ ] `0xA0` LOG0
- [ ] `0xA1` LOG1
- [ ] `0xA2` LOG2
- [ ] `0xA3` LOG3
- [ ] `0xA4` LOG4

### System (0xF0–0xFF)
- [ ] `0xF0` CREATE
- [ ] `0xF1` CALL
- [ ] `0xF2` CALLCODE
- [x] `0xF3` RETURN
- [ ] `0xF4` DELEGATECALL
- [ ] `0xF5` CREATE2
- [ ] `0xFA` STATICCALL
- [x] `0xFD` REVERT
- [x] `0xFE` INVALID
- [ ] `0xFF` SELFDESTRUCT

Notes:
- Checklist reflects commonly recognized opcodes up through recent forks (e.g., PUSH0, TLOAD/TSTORE, MCOPY, BLOBBASEFEE). Some opcodes are context-dependent at runtime and are intentionally not implemented in this compile-time interpreter.
- Unknown opcodes result in a type-level `unknown_opcode` error; unsupported stack effects produce `stack_underflow`.

## How It Works

TypeVM uses TypeScript's advanced type system features including:
- Recursive conditional types for bytecode parsing
- Tuple manipulation for stack operations
- Template literal types for hex string processing
- Mapped types for opcode definitions
- Type-level arithmetic using tuple lengths

The execution engine recursively processes bytecode bytes, maintaining a type-level stack and tracking execution state, all at compile time.

### Gas Metering

- Every executed opcode consumes gas per a simple schedule for currently supported instructions (e.g., `ADD`/`EQ`/`ISZERO` cost 3, `POP` cost 2, `JUMPDEST` cost 1, `PUSH0` cost 2, `PUSH1–32`/`DUP`/`SWAP` cost 3). Control-flow halts like `STOP`, `RETURN`, `REVERT`, and `INVALID` are charged 0 in this model.
- Default gas limit is `1000`. Provide a custom limit via the second generic parameter: `ExecuteEvm<'0x6001F3', 64>`.
- Results expose `gasUsed` and `gasLimit` fields for introspection.

## Installation

```bash
npm install typescript-evm
```

## Type Checking

Run type checks to verify the type tests:

```bash
npm run typecheck
```

## Limitations

- Maximum 256 execution steps (prevents infinite type recursion)
- Limited opcode support (no memory, storage, gas, or external calls)
- TypeScript's type recursion limits apply
- Compile times increase with bytecode complexity

## Use Cases

- 🎓 Educational: Learn EVM opcodes and type-level programming
- 🔬 Research: Explore capabilities of TypeScript's type system
- 🎨 Art: Create compile-time smart contract verification tools
- 🧪 Experimentation: Test EVM bytecode behavior at type-level

## License

MIT

## Contributing

Contributions welcome! This is an experimental project exploring the limits of TypeScript's type system.
