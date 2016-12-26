/* eslint-disable no-console, func-names */
import utils from './utils';

const sfrMap = new Map([
  ['A', 0xE0],
  ['B', 0xF0],
  ['P0', 0x80],
  ['P1', 0x90],
  ['P2', 0xA0],
  ['P3', 0xB0],
  ['SP', 0x81],
  ['DPL', 0x82],
  ['DPH', 0x83],
  ['PCON', 0x87],
  ['TCON', 0x88],
  ['TMOD', 0x89],
  ['TL0', 0x8A],
  ['TL1', 0x8B],
  ['TH0', 0x8C],
  ['TH1', 0x8D],
  ['SCON', 0x98],
  ['SBUF', 0x99],
  ['IE', 0xA8],
  ['IP', 0xB8],
  ['PSW', 0xD0],
]);

const ram = new Uint8Array(257);
ram[sfrMap.get('SP')] = 0x07;

const instructionCheck = new Map([
  ['setb', function (operands) {
    if (operands.length === 1 && utils.isBitAddr(operands[0])) {
      return true;
    }
    return false;
  }],
  ['clr', function (operands) {
    if (operands.length === 1 &&
       (utils.isBitAddr(operands[0]) || parseInt(operands[0], 10) === sfrMap.get('A'))) {
      return true;
    }
    return false;
  }],
  ['mov', function (operands) {
    console.log(operands);
    return true;
  }],
  ['cpl', function (operands) {
    if (operands.length === 1 &&
       (utils.isBitAddr(operands[0]) || parseInt(operands[0], 10) === sfrMap.get('A'))) {
      return true;
    }
    return false;
  }],
  ['add', function (operands) {
    console.log(operands);
    return true;
  }],
  ['addc', function (operands) {
    console.log(operands);
    return true;
  }],
  ['subb', function (operands) {
    console.log(operands);
    return true;
  }],
  ['mul', function (operands) {
    if (operands.length === 1 && /^ab$/i.test(operands[0])) {
      return true;
    }
    return false;
  }],
  ['div', function (operands) {
    if (operands.length === 1 && /^ab$/i.test(operands[0])) {
      return true;
    }
    return false;
  }],
  ['ajmp', function (operands) {
    if (operands.length === 1 && utils.isLabel(operands[0])) {
      return true;
    }
    return false;
  }],
  ['ljmp', function (operands) {
    if (operands.length === 1 && utils.isLabel(operands[0])) { return true; }
    return false;
  }],
  ['sjmp', function (operands) {
    if (operands.length === 1 && utils.isLabel(operands[0])) { return true; }
    return false;
  }],
  ['djnz', function (operands) {
    if (operands.length === 2 && utils.isByteAddr(operands[0]) && sfrMap.has(operands[1])) {
      return true;
    }
    return false;
  }],
  ['jbc', function (operands) {
    if (operands.length === 2 && utils.isBitAddr(operands[0]) && sfrMap.has(operands[1])) {
      return true;
    }
    return false;
  }],
  ['jb', function (operands) {
    if (operands.length === 2 && utils.isBitAddr(operands[0]) && sfrMap.has(operands[1])) {
      return true;
    }
    return false;
  }],
  ['jnb', function (operands) {
    if (operands.length === 2 && utils.isBitAddr(operands[0]) && sfrMap.has(operands[1])) {
      return true;
    }
    return false;
  }],
  ['jc', function (operands) {
    if (operands.length === 1 && utils.isLabel(operands[0])) { return true; }
    return false;
  }],
  ['jnc', function (operands) {
    if (operands.length === 1 && utils.isLabel(operands[0])) { return true; }
    return false;
  }],
  ['jz', function (operands) {
    if (operands.length === 1 && utils.isLabel(operands[0])) { return true; }
    return false;
  }],
  ['jnz', function (operands) {
    if (operands.length === 1 && utils.isLabel(operands[0])) { return true; }
    return false;
  }],
  ['cjne', function (operands) {
    console.log(operands);
    return true;
  }],
  ['lcall', function (operands) {
    if (operands.length === 1 && utils.isLabel(operands[0])) { return true; }
    return false;
  }],
  ['acall', function (operands) {
    if (operands.length === 1 && utils.isLabel(operands[0])) { return true; }
    return false;
  }],
  ['anl', function (operands) {
    console.log(operands);
    return true;
  }],
  ['orl', function (operands) {
    console.log(operands);
    return true;
  }],
  ['xrl', function (operands) {
    console.log(operands);
    return true;
  }],
  ['rl', function (operands) {
    if (operands.length === 1 && parseInt(operands[0], 10) === sfrMap.get('A')) {
      return true;
    }
    return false;
  }],
  ['rlc', function (operands) {
    if (operands.length === 1 && parseInt(operands[0], 10) === sfrMap.get('A')) {
      return true;
    }
    return false;
  }],
  ['rr', function (operands) {
    if (operands.length === 1 && parseInt(operands[0], 10) === sfrMap.get('A')) {
      return true;
    }
    return false;
  }],
  ['rrc', function (operands) {
    if (operands.length === 1 && parseInt(operands[0], 10) === sfrMap.get('A')) {
      return true;
    }
    return false;
  }],
  ['da', function (operands) {
    if (operands.length === 1 && parseInt(operands[0], 10) === sfrMap.get('A')) {
      return true;
    }
    return false;
  }],
  ['swap', function (operands) {
    if (operands.length === 1 && parseInt(operands[0], 10) === sfrMap.get('A')) {
      return true;
    }
    return false;
  }],
  ['xch', function (operands) {
    console.log(operands);
    return true;
  }],
  ['xchd', function (operands) {
    console.log(operands);
    return true;
  }],
  ['push', function (operands) {
    if (operands.length === 1 && utils.isByteAddr(operands[0])) { return true; }
    return false;
  }],
  ['pop', function (operands) {
    if (operands.length === 1 && utils.isByteAddr(operands[0])) { return true; }
    return false;
  }],
  ['inc', function (operands) {
    if (operands.length === 1 && utils.isByteAddr(operands[0])) { return true; }
    return false;
  }],
  ['dec', function (operands) {
    if (operands.length === 1 && utils.isByteAddr(operands[0])) { return true; }
    return false;
  }],
  ['nop', function (operands) {
    if (operands.length === 0) { return true; }
    return false;
  }],
]);

export default {
  sfrMap,
  ram,
  instructionCheck,
  code: '',
  labels: new Map(),
  programCounter: 0,
};
