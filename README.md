# TypeVM

A TypeScript type-level EVM (Ethereum Virtual Machine) interpreter. Execute EVM bytecode entirely at compile time using TypeScript's type system!

## What is this?

TypeVM is an experimental EVM bytecode interpreter implemented entirely in TypeScript's type system. It parses and executes EVM bytecode at compile-time, returning results as TypeScript types. No runtime code execution - just pure type-level computation.

## Features

- ✅ Type-level bytecode parsing and execution
- ✅ Stack operations (PUSH, POP, DUP, SWAP)
- ✅ Arithmetic and logic (EQ, ISZERO)
- ✅ Control flow opcodes (STOP, RETURN, REVERT, INVALID, JUMPDEST)
- ✅ Compile-time error detection (stack underflow, invalid opcodes, etc.)
- ✅ Step limit protection (256 steps max)

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
- `0x14` - **EQ**: Check equality of top two items
- `0x15` - **ISZERO**: Check if top item is zero

### Control Flow
- `0x00` - **STOP**: Halt execution
- `0x5B` - **JUMPDEST**: Jump destination (no-op)
- `0xF3` - **RETURN**: Return with top of stack as return data
- `0xFD` - **REVERT**: Revert execution
- `0xFE` - **INVALID**: Invalid opcode error

## How It Works

TypeVM uses TypeScript's advanced type system features including:
- Recursive conditional types for bytecode parsing
- Tuple manipulation for stack operations
- Template literal types for hex string processing
- Mapped types for opcode definitions
- Type-level arithmetic using tuple lengths

The execution engine recursively processes bytecode bytes, maintaining a type-level stack and tracking execution state, all at compile time.

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
