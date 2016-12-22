/* eslint-disable no-console */
import _ from 'lodash';
import memory from './data';
import funcs from './instructions';

let resetMemory = true;
let debugProgramCounterStack = [];

function convertToBin(number, padWidth = 8) {
  const toString = Number.prototype.toString;
  const toBin = _.partialRight(toString.call.bind(toString), 2);
  return _.padStart(toBin(number), padWidth, '0');
}

function changeBit(addr, bit, value) {
  const binary = convertToBin(memory.ram[addr]);
  return _
    .chain(binary)
    .toArray()
    .reverse()
    .tap(arr => _.set(arr, bit, value))
    .reverse()
    .join('')
    .value();
}

function isBitSet(addr, bit) {
  const binary = convertToBin(memory.ram[addr]);
  return _
    .chain(binary)
    .toArray()
    .reverse()
    .thru(arr => arr[bit] === '1')
    .value();
}

function convertToDec(op, pattern, base) {
  const [, addrMode = '', number] = pattern.exec(op);
  const decimal = _.parseInt(number, base);
  return `${addrMode}${decimal}`;
}

function displayRam() {
  console.log(memory.ram);
}

// See http://stackoverflow.com/a/359910/4405407 for explanation
function executeFunctionByName(funcName, context, args) {
  const namespaces = _.split(funcName, '.');
  const func = namespaces.pop();
  let ctx = context;
  _.forEach(namespaces, (nmsp) => { ctx = ctx[nmsp]; });
  return ctx[func](...args);
}

function handleRegisters(reg) {
  return reg.replace(/^C$/i, `${memory.sfrMap.get('PSW')}.7`)
    .replace(/^(@|#)?([a-z]{1,4}\d?)(\.\d)?$/i, (match, addrMode = '', sfr, bit = '') => {
      console.log(match);
      let sfrAddr = memory.sfrMap.get(_.toUpper(sfr));
      if (_.isUndefined(sfrAddr)) {
        sfrAddr = sfr;
      }
      return `${addrMode}${sfrAddr}${bit}`;
    }).replace(/^(@)?R([0-7])$/i, (match, addrMode = '', number) => {
      const regBankMode = _.parseInt(
        convertToBin(memory.ram[memory.sfrMap.get('PSW')]).slice(3, 5), 2);
      return `${addrMode}${_.parseInt(number) + (regBankMode * 8)}`;
    });
}

function translateToBitAddressable(op) {
  const [addr, bit] = _.chain(op).split('.').map(_.parseInt).value();
  if (_.inRange(addr, 128) && _.isUndefined(bit)) {
    return [_.toInteger(addr / 8) + 32, addr % 8];
  }
  return [addr, bit];
}

function handleAddressingMode(op) {
  const number = _.parseInt(op.slice(1));
  if (/^#/i.test(op)) {
    memory.ram[256] = number;
    return '256';
  } else if (/^@/i.test(op)) {
    return `${memory.ram[number]}`;
  } else if (/^\//i.test(op)) {
    const [byteAddr, bit] = translateToBitAddressable(op.slice(1));
    memory.ram[256] = isBitSet(byteAddr, bit) ? 0 : 1;
    return '256.0';
  }
  return op;
}

function parseLine(code) {
  if (!/^\s*(?:;.*)?$/.test(code)) {
    // This regex matches all types of instructions with labels and operands. Try it out here http://www.regexr.com/
    // FIXME: Optimise this regex and make it readable
    const pattern = new RegExp([
      /\s*(?:[a-z]+\s*?:)?/, // Label:
      /\s*?([a-z]{2,5})\s*/, // Instruction
      // eslint-disable-next-line max-len
      /(\s*(?:(?:@|#)?(?:[a-z]{1,4})?(?:[\da-z]*(?:\.[\da-z]*)?[bh]?)?(?:\+[a-z]{1,4})?\s*,)*(?:\s*(?:@|#|\/)?(?:[a-z]{1,4})?(?:[\da-z]*(?:\.[\da-z]*)?[bh]?)?(?:\+[a-z]{1,4})?))?/, // Operands
    ].map(r => r.source).join(''), 'i');
    let [, instruction, operands = []] = pattern.exec(code);

    instruction = _.replace(instruction, /\s+/, '');
    console.log(`Instruction = ${instruction}`);

    // Filter out empty operands (?)
    operands = _
      .chain(operands)
      .replace(/\s+/, '')
      .split(',')
      .filter(v => v !== '')
      .value();

    _.forEach(operands, (operand, index) => {
      let op = operand;
      if (/[0-9a-f]+h$/i.test(op)) {
        // Convert all hex numbers to decimal
        op = convertToDec(op, /(@|#)?([0-9a-f]+)h/i, 16);
      } else if (/[01]+b$/i.test(op)) {
        // Convert all binary numbers to decimal
        op = convertToDec(op, /(@|#)?([01]+)b/i, 2);
      } else if (/[0-9]+d$/i.test(op)) {
        // Remove optional D from decimal number
        op = op.slice(0, -1);
      }

      // Replace all registors with their ram addresses (in decimal)
      op = handleRegisters(op);
      // Replace @ with the address and save immediate data at 256 index of RAM
      op = handleAddressingMode(op);

      operands[index] = op;
    });
    console.log(`Operands: ${operands}`);

    // Call appropriate function with operands
    executeFunctionByName(instruction.toLowerCase(), funcs, operands);
    if (_.includes(
        operands, _.toString(memory.sfrMap.get('A')))) {
      funcs.updateParity();
    }
  }
}

function handleExecution(oldProgramCounter) {
  const code = memory.code;
  let i = oldProgramCounter;
  while (i < code.length) {
    if (/^\s*(?:([a-z]+)\s*?:)?\s*(?:RET|RETI|END)\s*(?:;.*)?$/i.test(code[i])) {
      break;
    }
    memory.programCounter += 1;
    parseLine(code[i]);
    i = memory.programCounter;
  }
}

function initMemory() {
  memory.ram.set(new Uint8Array(257));
  memory.ram[memory.sfrMap.get('SP')] = 0x07;
  memory.code = '';
  memory.labels = new Map();
  memory.programCounter = 0;
}

function initValues(input) {
  initMemory();
  const code = _.split(input, '\n');
  const pattern = /\s*(?:([a-z]+)\s*?:)?/i;

  _.forEach(code, (line, index) => {
    code[index] = _.trim(line);
    const [, label] = pattern.exec(line);
    if (!_.isUndefined(label)) {
      memory.labels.set(label, index);
    }
  });
  memory.code = code;
}

function handleDebug(input) {
  const END = /^\s*(?:([a-z]+)\s*?:)?\s*(?:END)\s*(?:;.*)?$/i;
  const RET = /^\s*(?:([a-z]+)\s*?:)?\s*(?:RET|RETI)\s*(?:;.*)?$/i;
  const CALL = /^\s*(?:[a-z]+\s*?:)?\s*(?:LCALL|ACALL)\s+([a-z]+)\s*(?:;.*)?$/i;

  if (resetMemory || !(_.isEqual(memory.code, _.split(input, '\n')))) {
    initValues(input);
    resetMemory = false;
    debugProgramCounterStack = [];
  }
  memory.programCounter += 1;
  if (END.test(memory.code[memory.programCounter - 1])) {
    resetMemory = true;
  } else if (RET.test(memory.code[memory.programCounter - 1])) {
    if (debugProgramCounterStack.length > 0) {
      memory.programCounter = debugProgramCounterStack.pop();
      memory.ram[memory.sfrMap.get('SP')] -= 2;
    } else {
      resetMemory = true;
    }
  } else {
    const label = CALL.exec(memory.code[memory.programCounter - 1]);
    if (!_.isNull(label)) {
      debugProgramCounterStack.push(memory.programCounter);
      memory.programCounter = memory.labels.get(label[1]);
      memory.ram[memory.sfrMap.get('SP')] += 2;
    } else {
      parseLine(memory.code[memory.programCounter - 1]);
    }
  }
  displayRam();
  if (memory.programCounter >= memory.code.length) {
    resetMemory = true;
  }
  return { status: true, line: memory.programCounter - 1 };
}

export default {
  changeBit,
  convertToBin,
  displayRam,
  handleDebug,
  handleExecution,
  handleRegisters,
  initValues,
  isBitSet,
  translateToBitAddressable,
};
