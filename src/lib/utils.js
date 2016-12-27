/* eslint-disable no-console */
import _ from 'lodash';
import memory from './data';
import funcs from './instructions';

function isInt(str) {
  return (str.indexOf('.') === -1);
}

function isFloat(str) {
  return (str.indexOf('.') !== -1);
}

function isPort(addr) {
  const intAddr = parseInt(addr, 10);
  return (intAddr === 0x80 || intAddr === 0x90 || intAddr === 0xA0 || intAddr === 0xB0);
}

function isALU(addr) {
  const intAddr = parseInt(addr, 10);
  return (intAddr === 0xE0 || intAddr === 0xF0 || addr === `${memory.sfrMap.get('PSW')}.7`);
}

function isRAM(addr) {
  const intAddr = parseInt(addr, 10);
  return (intAddr >= 0 && intAddr <= 127);
}

function isSFR(addr) {
  const intAddr = parseInt(addr, 10);
  return (!(isPort(addr) && isALU(addr) && isRAM(addr) && intAddr >= 128 && intAddr <= 255));
}

function isRtoR(addr1, addr2) {
  const intAddr1 = parseInt(addr1, 10);
  const intAddr2 = parseInt(addr2, 10);
  return ((intAddr1 >= 0 && intAddr1 <= 31) && (intAddr2 >= 0 && intAddr2 <= 31));
}

function isPortToPort(addr1, addr2) {
  return (isPort(addr1) && isPort(addr2));
}

function isSFRtoSFR(addr1, addr2) {
  return (isSFR(addr1) && isSFR(addr2));
}

function isBitAddr(addr) {
  const intAddr = parseInt(addr, 10);
  if (isInt(addr)) {
    return ((intAddr >= 0 && intAddr <= 127));
  }
  if (isFloat(addr)) {
    // All SFRs that whose addresses are divisible by 8 can be accessed with bit operations.
    // http://www.8052.com/tutsfr.php
    return ((intAddr % 8 === 0) && (intAddr >= 128 && intAddr <= 256));
  }
  return false;
}

function isByteAddr(addr) {
  const intAddr = parseInt(addr, 10);
  return ((isInt(addr)) && ((intAddr >= 0 && intAddr <= 31) || (intAddr >= 48 && intAddr <= 256)));
}

function isLabel(label) {
  return (memory.labels.has(label));
}

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
    .replace(/^(@)?([a-z]{1,4}[0-3]?)(\.[0-7])?$/i, (match, addrMode = '', sfr, bit = '') => {
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
  let valid = { status: true };
  if (!/^\s*(?:;.*)?$/.test(code)) {
    // This regex matches all types of instructions with labels and operands. Try it out here http://www.regexr.com/
    // FIXME: Optimise this regex and make it readable
    const pattern = new RegExp([
      /\s*(?:[a-z]+\s*?:)?/, // Label:
      /\s*?([a-z]{2,5})\s*/, // Instruction
      // eslint-disable-next-line max-len
      // /(\s*(?:(?:@|#)?(?:[a-z]{1,4})?(?:[\da-z]*(?:\.[\da-z]*)?[bh]?)?(?:\+[a-z]{1,4})?\s*,)*(?:\s*(?:@|#|\/)?(?:[a-z]{1,4})?(?:[\da-z]*(?:\.[\da-z]*)?[bh]?)?(?:\+[a-z]{1,4})?))?/, // Operands
      // eslint-disable-next-line max-len
      /((?:(?:(?:[01]+b)|(?:[\da-f]+h)|(?:\d+d?))|(?:@R[01])|(?:[a-z]+[0-7]?(?:\.[0-7])?))(?:\s*,\s*(?:(?:(?:#|\/)?(?:(?:[01]+b)|(?:[\da-f]+h)|(?:\d+d?)))|(?:@R[01])|(?:[a-z]+[0-7]?(?:\.[0-7])?)))?(?:\s*,\s*(?:[a-z]+\s*?))?)?/, // Operands
    ].map(r => r.source).join(''), 'i');
    let [, instruction, operands = []] = pattern.exec(code);

    instruction = _.replace(instruction, /\s+/g, '').toLowerCase();
    console.log(`Instruction = ${instruction}`);

    // Remove spaces
    operands = _
      .chain(operands)
      .replace(/\s+/g, '')
      .split(',')
      .value();

    _.forEach(operands, (operand, index) => {
      let op = operand;
      if (/[0-9a-f]+h$/i.test(op)) {
        // Convert all hex numbers to decimal
        op = convertToDec(op, /(@|#|\/)?([0-9a-f]+)h/i, 16);
      } else if (/[01]+b$/i.test(op)) {
        // Convert all binary numbers to decimal
        op = convertToDec(op, /(@|#|\/)?([01]+)b/i, 2);
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

    const instructionCheck = memory.instructionCheck.get(instruction);
    if (!_.isUndefined(instructionCheck)) {
      valid = instructionCheck(operands);
      if (valid.status) {
        // Call appropriate function with operands
        const executionError = executeFunctionByName(instruction, funcs, operands);
        if (!_.isUndefined(executionError)) {
          valid = executionError;
        }
        if (_.includes(
            operands, _.toString(memory.sfrMap.get('A')))) {
          funcs.updateParity();
        }
      }
    } else {
      valid = { status: false, msg: 'Invalid instruction' };
    }
  }
  return valid;
}

function handleExecution() {
  const code = memory.code;
  let executionStatus = { status: true };
  while (memory.programCounter < code.length) {
    if (/^\s*(?:([a-z]+)\s*?:)?\s*(?:RET|RETI|END)\s*(?:;.*)?$/i.test(code[memory.programCounter])) {
      executionStatus.line = memory.programCounter;
      break;
    }
    memory.programCounter += 1;
    executionStatus = parseLine(code[memory.programCounter - 1]);
    if (!executionStatus.status) {
      if (_.isUndefined(executionStatus.line)) {
        executionStatus.line = memory.programCounter - 1;
      }
      break;
    }
  }
  return executionStatus;
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

export default {
  isPort,
  isALU,
  isRAM,
  isSFR,
  isRtoR,
  isPortToPort,
  isSFRtoSFR,
  isBitAddr,
  isByteAddr,
  isLabel,
  changeBit,
  convertToBin,
  displayRam,
  parseLine,
  handleExecution,
  handleRegisters,
  initValues,
  isBitSet,
  translateToBitAddressable,
};
