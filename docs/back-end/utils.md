# [utils.js](../../src/lib/utils.js)

## resetMemory
> Boolean which indicates whether to reset the current state of microcontroller before executing the next instruction.

## commentedRegex
> Removes comments from commented regex strings (example: <comment here>).

## isInt
> Takes a string parameter and checks if it represents an int or not.

Examples:  
`isInt('1')` returns `true`.  
`isInt('1.0')` returns `false`.

## isFloat
> Takes a string parameter and checks if it represents a float or not.

Examples:  
`isFloat('1.0')` returns `true`.  
`isFloat('1')` returns `false`.

## isPort
> Takes a string parameter and checks if it is the address of a port.

## isALU
> Takes a string parameter and checks if the address belongs to the ALU (i.e. SFRs 'A' and 'B' and carry).

## isRAM
> Takes a string parameter and checks if the address belongs to RAM (register banks/bit addressable memory/scratchpad RAM).

## isSFR
> Takes a string parameter and checks if it is the address of any SFR.

## isRtoR
> Takes two string parameters and checks if both addresses belong to register banks.

## isPortToPort
> Takes two string parameters and checks if both addresses belong to ports.

## isSFRtoSFR
> Takes two string parameters and checks if both addresses belong to SFRs.

## isBitAddr
> Takes a string parameter and checks if address is a bit address.

## isByteAddr
> Takes a string parameter and checks if address is a byte address.

## isLabel
> Takes a string parameter and checks if it is a valid label.

## convertToBin
> Converts the specified number to binary and pads it with specified number of zeros (default = 8).

Example:  
`convertToBin(2, 8);` returns `'00000010'`

## changeBit
> Changes the specified bit of the specified memory address to the specified value (0/1).

Example:  
Current value at address 224: 0 (binary: 00000000)  
`changeBit(224, 1, 1);`  
New value at address 224: 2 (binary: 00000010)

## isBitSet
> Checks if the specified bit of the specified memory address is set or not.

Example:  
Current value at address 224: 2 (binary: 00000010)
`isBitSet(224, 1);` returns `true`.

## convertToDec
> Extracts the number using the specified regex from the specified operand, converts it to decimal using the specified base, while preserving the addressing mode.

Example:  
`convertToDec('#10B', /(@|#|\/)?([01]+)b/i, 2);` returns `'#2'`.  
Note that the regex specified must take care of the addressing mode as shown.

## executeFunctionByName
> Executes the function when having it's name as string.

## handleRegisters
> Converts SFRs and register banks to their memory addresses in decimal, preserving the addressing mode.

Example:  
`handleRegisters('P0.0');` returns `'128.0'`

## translateToBitAddressable
> Converts byte address to bit address used by instructions like `SETB`.  
Returns an array with byte address and bit number.

Example:  
`translateToBitAddressable('2');` returns `[32, 2]`.

Explanation:
The instruction `SETB 2` is used to change the bit addressable memory section of the RAM, which is the 2nd bit (0 indexed) of the byte address 32.

## handleAddressingMode
> Converts indirect memory addresses to direct memory addresses using the values of register banks. And stores immediate data in the array index 256 of `ram`.

## parseLine
> Parses and executes the specified line.  
Returns an object indicating the status of execution and an error message if any error occurs.

## initMemory
> Resets values of `ram`, `SP`, `code`, `labels`,  `programCounter`, and `programCounterStack`.

## initValues
> Calls `initMemory` to reset state of microcontroller and initializes `code` and `labels`.

## executeNextLine
> 1. Checks for `END` assembler directive to stop execution of code.
> 2. Checks for blank lines and `ORG` assembler directive and ignores them.
> 3. Resets state of microcontroller before executing next line, if required.
> 4. Calls `parseLine` to parse and execute the next line.

> Returns an object indicating the status of execution, an error message if error occurred, and the line number which will be executed next.

## handleExecution
> Resets the state of microcontroller and executes the code from the beginning continuously until either an error occurs or all lines are executed.  
Returns an object indicating the status of execution of the last line executed, an error message if error occurred.
