# 8051.js Documentation

## [Back-End](back-end)
Docs related to the [back-end code](../src/lib)

>It is recommended to understand the 8051 microcontroller, its architecture, and instruction set before reading the docs.

### Architecture
To simulate 8-bit RAM (register banks, scratchpad RAM, and SFRs) an ```Uint8Array``` of length 257 is used (the one extra element is explained further). Each index of this array represents a byte addressable location in RAM (except the extra trailing index) and the values stored represent the data in RAM.

The variable ```programCounter``` represents the line number to be executed next.

```programCounterStack``` is used to store the value of ```programCounter``` when making subroutine calls.

```sfrMap``` maps SFR names to their memory addresses.

### Working of simulator

#### Modes of execution
There are 2 modes of execution: Run mode and Debug mode.

1. Run Mode
In this mode, the current state of the microcontroller is reset and the assembly code is executed from the beginning continuously until an error occurs or all lines are executed.
2. Debug Mode
In this mode, no changes to the current state of the microcontroller are made (unless the previous line of execution returned an error or it was the last line of the assembly code) and it only executes one line of the assembly code per call.

#### Parsing assembly code
Initially, the assembly code entered by the user is broken into lines and stored in an array ```code```, and all labels are extracted from each line and corresponding line numbers are stored in a ```Map``` called ```labels```. The assembly code is then parsed and executed one line at a time.

Because operands can be of various types (memory address, SFR, immediate data, etc) and in various formats (binary, decimal, or hexadecimal) it is required to convert them into a single type and format.  
Each operand goes through the following steps:

1. Binary and hexadecimal numbers (memory address and immediate data) are converted into decimals.
2. SFRs are replaced with their memory addresses using ```sfrMap```.
3. Indirect memory addresses (example: @R0) are converted to direct memory addresses by using the value stored at that register bank (i.e. R0 in the example).
4. In order to convert immediate data into memory address, the immediate data is stored into the extra trailing index (256) in the RAM and the memory address 256 is used.

By doing the above, all operands are converted into memory addresses, which are just array indices of ```ram```.  
(Note that labels for call and jump functions are not changed in this process)

Now, a check is performed to see if the entered instruction exists and the operands are allowed for the given instruction. If the check returns true, the corresponding function is called with the operands as the parameters.

#### Flow of execution
The flow of execution of assembly code is controlled using ```programCounter```. It stores the line number to be executed next.  
Subroutine calls (made using instructions like ```LCALL```) push the current value of ```programCounter``` in ```programCounterStack``` and update ```programCounter``` to the new value using the ```Map``` ```labels```.   
The ```RET``` and ```RETI``` instructions pop the value from ```programCounterStack``` and store it in ```programCounter``` to end a subroutine call.

#### Assembler directives
The ```END``` directive stops the execution of code.  
The ```ORG``` directive is ignored since it is not useful in the simulator.  
All other directives are not supported and may result in an error.

## [Vue Components](components)
Docs related to the [Vue.js components](../src/components)
