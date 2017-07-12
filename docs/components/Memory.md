# [Memory](../../src/components/Memory.vue)

# HTML
The memory of the microcontroller is represented by a table consisting of two columns:

- SFR: Values of all the special function registers are displayed here.
- Core: Values of the first 128 memory locations are displayed here.

All memory values are shown in hexadecimal format.

# JS
The table's values are updated as the `memory` changes.
