# Fix Required

The LOG implementation at line 306-311 is incorrect. It treats ALL LOG opcodes the same, popping only 3 items.

Correct behavior:
- LOG0 (0xA0): pops 2 items (offset, size)
- LOG1 (0xA1): pops 3 items (offset, size, topic1)
- LOG2 (0xA2): pops 4 items (offset, size, topic1, topic2)
- LOG3 (0xA3): pops 5 items (offset, size, topic1, topic2, topic3)
- LOG4 (0xA4): pops 6 items (offset, size, topic1, topic2, topic3, topic4)

Also missing:
- PC (0x58): should push 0x00 to stack (no program counter model)

The fix needs to separate each LOG opcode into its own case.