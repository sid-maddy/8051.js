# [data.js](../../src/lib/data.js)

## sfrMap
> Maps SFR names to memory addresses.

## ram
> Simulates 8-bit RAM (register banks, scratchpad RAM, SFRs).
See [README](../README.md) to understand the extra index.

## instructionCheck
> Maps instruction names to functions which check if the operands are allowed.
All functions take an array of operands and return an object with `status` indicating the result of the check and an error `msg` if the operands are not allowed (i.e. `status` is false).  
Example: The function mapped to 'setb' checks if there is a single operand, and it is a bit address.