/* eslint-disable no-console, no-plusplus */
import memory from './data';
import funcs from './instructions';

function convertToDec(op, pattern, base) {
  const temp = pattern.exec(op);
  const v = parseInt(temp[2], base);

  let result = '';
  if (temp[1]) {
    result += temp[1];
  }
  return `${result + v}`;
}

function displayRam() {
  console.log(memory.ram);
}

// See http://stackoverflow.com/a/359910/4405407 for explanation
function executeFunctionByName(funcName, context, args) {
  const namespaces = funcName.split('.');
  const func = namespaces.pop();
  let ctx = context;
  for (let i = 0, n = namespaces.length; i < n; ++i) {
    ctx = ctx[namespaces[i]];
  }
  return ctx[func](...args);
}

function handleRegisters(reg) {
  return reg.replace(/^C$/i, '208.7')
    .replace(/^(@|#)?([a-z]{1,4})(\.\d)?$/i, (match, addrMode, sfr, bit) => {
      let result = '';
      if (addrMode) {
        result += addrMode;
      }
      const sfrAddr = memory.sfrMap.get(sfr.toUpperCase());
      if (sfrAddr) {
        result += `${sfrAddr}`;
      }
      if (bit) {
        result += bit;
      }
      return result === '' ? sfr : result;
    }).replace(/^(@)?R([0-7])$/i, (match, addrMode, number) => {
      let result = '';
      if (addrMode) {
        result += addrMode;
      }
      result += `${parseInt(number, 10) + (memory.ram[208] * 8)}`;
      return result;
    });
}

function handleAddressingMode(op) {
  let result = op;
  if (op.match(/^#/i)) {
    memory.ram[256] = parseInt(op.substring(1), 10);
    result = '256';
  } else if (op.match(/^@/i)) {
    result = `${memory.ram[parseInt(op.substring(1), 10)]}`;
  }
  return result;
}

function parseLine(code) {
  // This regex matches all types of instructions with labels and operands. Try it out here http://www.regexr.com/
  // FIXME: Optimise this regex and make it readable
  const pattern = new RegExp([
    /(\s*[a-z]+\s*:\s*)?/, // Label:
    /(\s*[a-z]{2,5}\s+)/, // Instruction
    // eslint-disable-next-line max-len
    /((\s*(@|#)?([a-z]{1,4})?([\da-z]*(\.[\da-z]*)?[bh]?)?(\+[a-z]{1,4})?\s*,)*(\s*(@|#)?([a-z]{1,4})?([\da-z]*(\.[\da-z]*)?[bh]?)?(\+[a-z]{1,4})?)?)?/, // Operands
  ].map(r => r.source).join(''), 'i');
  const array = pattern.exec(code);

  // Check if label exists
  if (array[1]) {
    let label = array[1].replace(/\s/g, '');

    // Remove ':' from label
    label = label.replace(':', '');
    console.log(`Label = ${label}`);
  }

  // Remove all whitespaces from instructions
  const instruction = array[2].replace(/\s/g, '');
  console.log(`Instruction = ${instruction}`);

  // Check if any operands exist
  let operands = [];
  if (array[3]) {
    let stringOfOperands = array[3];

    // Make MUL AB to MUL A, B
    // stringOfOperands = stringOfOperands.replace(/AB/i, 'A, B');
    stringOfOperands = stringOfOperands.replace(/\s+/, '');
    operands = stringOfOperands.split(',');

    // This loop removes all whitespaces and commas from the operands
    for (let i = 0, n = operands.length; i < n; ++i) {
      operands[i] = operands[i].replace(/[\s,]/g, '');
    }

    // Remove any empty operands from the array
    operands = operands.filter(v => v !== '');
    for (let i = 0, n = operands.length; i < n; ++i) {
      if (operands[i].match(/h$/i)) {
        // Convert all hex numbers to decimal
        operands[i] = convertToDec(operands[i], /(@|#)?([0-9a-f]+)h/i, 16);
      }

      if (operands[i].match(/[01]+b$/i)) {
        // Convert all binary numbers to decimal
        operands[i] = convertToDec(operands[i], /(@|#)?([01]+)b/i, 2);
      }

      // Replace all registors with their ram addresses (in decimal)
      operands[i] = handleRegisters(operands[i]);

      // Replace @ with the address and save immediate data at 256 index of RAM
      operands[i] = handleAddressingMode(operands[i]);
      console.log(`Operand[${i + 1}] = ${operands[i]}`);
    }
  }

  // Call appropriate function with operands
  executeFunctionByName(instruction.toLowerCase(), funcs, operands);
  funcs.updateParity();
}

function handleExecution(oldProgramCounter) {
  const code = memory.code;
  let i = oldProgramCounter;
  while (i < code.length) {
    console.log(code[i]);
    if (code[i].match(/(RET|END)/i)) {
      return;
    }
    memory.programCounter++;
    parseLine(code[i]);
    i = memory.programCounter;
  }
}

function initMemory() {
  memory.ram.set(new Uint8Array(257));
  memory.ram[memory.sfrMap.get('SP')] = 0x07;
  memory.labels = new Map();
  memory.programCounter = 0;
}

function translateToBitAddressable(op) {
  // FIXME: string parameter, integer comparison
  if (op >= 0 && op <= 127) {
    const temp = (((parseInt(op, 10)) / 8) + 32).toString();
    const number = temp.split('.');
    const integerPart = number[0];
    let fractionalPart = number[1];

    if (!fractionalPart) {
      return `${integerPart}.0`;
    }

    fractionalPart = (`${fractionalPart}000`).substring(0, 3);
    fractionalPart = `${fractionalPart.substring(0, 2)}.${fractionalPart.substring(2)}`;
    fractionalPart *= (8 / 100);
    return [integerPart, fractionalPart];
  }
  return op.split('.').map(v => parseInt(v, 10));
}

export default {
  displayRam,
  handleExecution,
  initMemory,
  translateToBitAddressable,
};
