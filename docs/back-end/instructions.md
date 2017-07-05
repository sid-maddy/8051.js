# [instructions.js](../../src/lib/instructions.js)

## updateParity
> Updates the value of parity bit in PSW based on the value of SFR 'A'.

## Other functions
> All other functions (except `jump`, `call`, and `jumpBit`) simulate the instruction set of 8051.  
`jump`, `call`, and `jumpBit` are used as helper functions.  
Note that instructions working with 16-bit registers (like `JMP`) are not supported. See [README](../README.md) for other unsupported features.