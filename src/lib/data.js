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
    let result = { status: true };
    if (operands.length === 1) {
      if (!utils.isBitAddr(operands[0])) {
        result = { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['clr', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if ((utils.isBitAddr(operands[0]) || parseInt(operands[0], 10) === sfrMap.get('A'))) {
        return { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['mov', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      console.log(operands);
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['cpl', function (operands) {
    return instructionCheck.get('clr')(operands);
  }],
  ['add', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      console.log(operands);
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['addc', function (operands) {
    return instructionCheck.get('add')(operands);
  }],
  ['subb', function (operands) {
    return instructionCheck.get('add')(operands);
  }],
  ['mul', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!(/^AB$/i.test(operands[0]))) {
        return { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['div', function (operands) {
    return instructionCheck.get('mul')(operands);
  }],
  ['ajmp', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!utils.isLabel(operands[0])) {
        return { status: false, msg: 'Invalid label' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['ljmp', function (operands) {
    return instructionCheck.get('ajmp')(operands);
  }],
  ['sjmp', function (operands) {
    return instructionCheck.get('ajmp')(operands);
  }],
  ['djnz', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      if (!utils.isByteAddr(operands[0])) {
        result = { status: false, msg: 'Invalid 1st operand' };
      }
      if (utils.isLabel(operands[1])) {
        result = { status: false, msg: 'Invalid label' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['jbc', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      if (!utils.isBitAddr(operands[0])) {
        result = { status: false, msg: 'Invalid 1st operand' };
      }
      if (utils.isLabel(operands[1])) {
        result = { status: false, msg: 'Invalid label' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['jb', function (operands) {
    return instructionCheck.get('jbc')(operands);
  }],
  ['jnb', function (operands) {
    return instructionCheck.get('jbc')(operands);
  }],
  ['jc', function (operands) {
    return instructionCheck.get('ajmp')(operands);
  }],
  ['jnc', function (operands) {
    return instructionCheck.get('ajmp')(operands);
  }],
  ['jz', function (operands) {
    return instructionCheck.get('ajmp')(operands);
  }],
  ['jnz', function (operands) {
    return instructionCheck.get('ajmp')(operands);
  }],
  ['cjne', function (operands) {
    let result = { status: true };
    if (operands.length === 3) {
      console.log(operands);
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['lcall', function (operands) {
    return instructionCheck.get('ajmp')(operands);
  }],
  ['acall', function (operands) {
    return instructionCheck.get('ajmp')(operands);
  }],
  ['anl', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      if (operands[0] === `${sfrMap.get('PSW')}.7`) {
        if (!(utils.isBitAddr(operands[1]) || operands[1] === '256.0')) {
          result = { status: false, msg: 'Invalid 2nd operand' };
        }
      } else if (parseInt(operands[0], 10) === sfrMap.get('A')) {
        if (!utils.isByteAddr(operands[1])) {
          result = { status: false, msg: 'Invalid 2nd operand' };
        }
      } else if (utils.isByteAddr(operands[0])) {
        if (parseInt(operands[1], 10) !== sfrMap.get('A') && operands[1] !== '256') {
          result = { status: false, msg: 'Invalid 2nd operand' };
        }
      } else {
        result = { status: false, msg: 'Invalid operands' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['orl', function (operands) {
    return instructionCheck.get('anl')(operands);
  }],
  ['xrl', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      if (!utils.isByteAddr(operands[0])) {
        result = { status: false, msg: 'Invalid 1st operand' };
      }
      if (!utils.isByteAddr(operands[1])) {
        result = { status: false, msg: 'Invalid 2nd operand' };
      }
      if (parseInt(operands[0], 10) === sfrMap.get('A')) {
        if (!utils.isByteAddr(operands[1])) {
          result = { status: false, msg: 'Invalid 2nd operand' };
        }
      } else if (utils.isByteAddr(operands[0])) {
        if (parseInt(operands[1], 10) !== sfrMap.get('A') && operands[1] !== '256') {
          result = { status: false, msg: 'Invalid 2nd operand' };
        }
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['rl', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!(parseInt(operands[0], 10) === sfrMap.get('A'))) {
        result = { status: false, msg: 'Operand must be accumulator' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['rlc', function (operands) {
    return instructionCheck.get('rl')(operands);
  }],
  ['rr', function (operands) {
    return instructionCheck.get('rl')(operands);
  }],
  ['rrc', function (operands) {
    return instructionCheck.get('rl')(operands);
  }],
  ['da', function (operands) {
    return instructionCheck.get('rl')(operands);
  }],
  ['swap', function (operands) {
    return instructionCheck.get('rl')(operands);
  }],
  ['xch', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      if (parseInt(operands[0], 10) !== sfrMap.get('A')) {
        result = { status: false, msg: 'First operand must be accumulator' };
      }
      if (!utils.isByteAddr(operands[1])) {
        result = { status: false, msg: 'Invalid 2nd operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['xchd', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      if (parseInt(operands[0], 10) !== sfrMap.get('A')) {
        result = { status: false, msg: 'First operand must be accumulator' };
      }
      if (!utils.isByteAddr(operands[1])) {
        result = { status: false, msg: 'Invalid 2nd operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['push', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!utils.isByteAddr(operands[0])) {
        result = { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['pop', function (operands) {
    return instructionCheck.get('push')(operands);
  }],
  ['inc', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!utils.isByteAddr(operands[0])) {
        result = { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['dec', function (operands) {
    return instructionCheck.get('inc')(operands);
  }],
  ['nop', function (operands) {
    let result = { status: true };
    if (operands.length !== 1) {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
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
