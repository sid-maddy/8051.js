/* eslint-disable no-console */
import _ from 'lodash';
import memory from './data';
import funcs from './instructions';

function convertToBinary(number) {
  const toString = Number.prototype.toString;
  const toBin = _.partialRight(toString.call.bind(toString), 2);
  return _.padStart(toBin(number), 8, '0');
}

function changeBit(addr, bit, value) {
  const binary = convertToBinary(memory.ram[addr]);
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
  const binary = convertToBinary(memory.ram[addr]);
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
    .replace(/^(@|#)?([a-z]{1,4})(\.\d)?$/i, (match, addrMode = '', sfr, bit = '') => {
      let sfrAddr = memory.sfrMap.get(_.toUpper(sfr));
      if (_.isUndefined(sfrAddr)) {
        sfrAddr = sfr;
      }
      return `${addrMode}${sfrAddr}${bit}`;
    }).replace(/^(@)?R([0-7])$/i, (match, addrMode = '', number) => {
      const regBankMode = _.parseInt(
        convertToBinary(memory.ram[memory.sfrMap.get('PSW')]).slice(3, 5), 2
      );
      return `${addrMode}${_.parseInt(number) + (regBankMode * 8)}`;
    });
}

function handleAddressingMode(op) {
  const number = _.parseInt(op.slice(1), 10);
  if (op.match(/^#/i)) {
    memory.ram[256] = number;
    return '256';
  } else if (op.match(/^@/i)) {
    return `${memory.ram[number]}`;
  }
  return op;
}

function parseLine(code) {
  // This regex matches all types of instructions with labels and operands. Try it out here http://www.regexr.com/
  // FIXME: Optimise this regex and make it readable
  const pattern = new RegExp([
    /\s*(?:[a-z]+\s*?:)?/, // Label:
    /\s*?([a-z]{2,5})\s+?/, // Instruction
    // eslint-disable-next-line max-len
    /(\s*(?:(?:@|#)?(?:[a-z]{1,4})?(?:[\da-z]*(?:\.[\da-z]*)?[bh]?)?(?:\+[a-z]{1,4})?\s*,)*(?:\s*(?:@|#)?(?:[a-z]{1,4})?(?:[\da-z]*(?:\.[\da-z]*)?[bh]?)?(?:\+[a-z]{1,4})?))/, // Operands
  ].map(r => r.source).join(''), 'i');
  let [, instruction, operands] = pattern.exec(code);

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
    if (op.match(/[0-9a-f]+h$/i)) {
      // Convert all hex numbers to decimal
      op = convertToDec(op, /(@|#)?([0-9a-f]+)h/i, 16);
    } else if (op.match(/[01]+b$/i)) {
      // Convert all binary numbers to decimal
      op = convertToDec(op, /(@|#)?([01]+)b/i, 2);
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
      operands, _.toString(memory.sfrMap.get('A'))
    )) {
    funcs.updateParity();
  }
}

function handleExecution(oldProgramCounter) {
  const code = memory.code;
  let i = oldProgramCounter;
  while (i < code.length) {
    if (code[i].match(/RET|END/i)) {
      return;
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

function translateToBitAddressable(op) {
  const [addr, bit] = _.chain(op).split('.').map(_.parseInt).value();
  if (_.inRange(addr, 128) && _.isUndefined(bit)) {
    return [_.toInteger(addr / 8) + 32, addr % 8];
  }
  return [addr, bit];
}

export default {
  changeBit,
  isBitSet,
  convertToBinary,
  displayRam,
  handleExecution,
  initMemory,
  translateToBitAddressable,
};
