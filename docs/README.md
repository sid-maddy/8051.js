# 8051.js Documentation

## [Back-End](back-end)
Docs related to the [back-end code](../src/lib)

>It is recommended to understand the 8051 microcontroller, its architecture, and instruction set before reading the docs.

### Architecture
To simulate 8-bit RAM (register banks, scratchpad RAM, and SFRs) an `Uint8Array` of length 257 is used (the one extra index is explained further), which is called `ram`. Each index of this array represents a byte addressable location in RAM (except the extra trailing index) and the values stored represent the data in RAM.

The variable `programCounter` represents the line number to be executed next.

`programCounterStack` is used to store the value of `programCounter` when making subroutine calls.

`sfrMap` maps SFR names to their memory addresses.

### Working of simulator

#### Modes of execution
There are 2 modes of execution: Run mode and Debug mode.

1. Run Mode

    In this mode, the current state of the microcontroller is reset and the assembly code is executed from the beginning continuously until either an error occurs or all lines are executed.

2. Debug Mode

    In this mode, no changes to the current state of the microcontroller are made (unless the previous line of execution either returned an error or was the last line of the assembly code) and it only executes one line of the assembly code per call.

#### Parsing assembly code
Initially, the assembly code entered by the user is broken into lines and stored in an array `code`, and labels (used by jump and call instructions) are detected from each line and corresponding line numbers are stored in a `Map` called `labels`. The assembly code is then parsed and executed one line at a time.

Because operands can be of various types (memory address, SFR, immediate data, etc) and in various formats (binary, decimal, or hexadecimal) it is required to convert them into a single type and format.
Each operand goes through the following steps:

1. Binary and hexadecimal numbers (memory address and immediate data) are converted into decimals.
2. SFRs are replaced with their memory addresses using `sfrMap`.
3. Indirect memory addresses (example: `@R0`) are converted to direct memory addresses by using the value stored at that register bank (i.e. `R0` in the example).
4. In order to convert immediate data into memory address, the immediate data is stored into the extra trailing index (256) in the RAM and the memory address 256 is used.

By doing the above, all operands are converted into byte addresses in decimal, which are just array indices of `ram`.
(Note that labels for call and jump instructions are not changed in this process)

Now, a check is performed to see if the entered instruction exists and if the operands are allowed for the given instruction. If the check returns true, the corresponding function is called with the operands as the parameters.

#### Bit addressable memory
All operands are converted into byte addresses as explained above. Thus, instructions which work with bit addresses (like `SETB`) and the ones which work with both bit and byte addresses (like `MOV`, `CPL`, etc.) use `translateToBitAddressable` function to convert byte addresses to bit addresses.

#### Flow of execution
The flow of execution of assembly code is controlled using `programCounter`. It stores the line number to be executed next and is incremented by 1 before executing the current instruction.

Subroutine calls (made using instructions like `LCALL`) push the current value of `programCounter` in `programCounterStack` and update `programCounter` to the new value using the `Map` `labels`.
Exiting a subroutine call (by `RET` or `RETI` instruction) pops the value from `programCounterStack` and stores it in `programCounter`.

#### Assembler directives
The `END` directive stops the execution of code.
The `ORG` directive is ignored since it is not useful in the simulator.
All other directives are not supported and may result in an error.

### Unsupported features
The simulator does not support:

1. Timers
2. External I/O
3. 16-bit registers (like `DPTR`)
4. Code memory
5. Assembler directives other than `ORG` and `END`
6. Interrupts

Also note that during subroutine calls the return address stored in stack memory is just line numbers since there is no code memory in the simulator.

## [Vue Components](components)
Docs related to the [Vue.js components](../src/components)
