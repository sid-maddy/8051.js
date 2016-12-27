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
    console.log(operands);
    return { status: true };
  }],
  ['cpl', function (operands) {
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
  ['add', function (operands) {
    console.log(operands);
    return { status: true };
  }],
  ['addc', function (operands) {
    console.log(operands);
    return { status: true };
  }],
  ['subb', function (operands) {
    console.log(operands);
    return { status: true };
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
  ['sjmp', function (operands) {
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
  ['djnz', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      if (!utils.isByteAddr(operands[0])) {
        result = { status: false, msg: 'Invalid operand' };
      } else if (utils.isLabel(operands[1])) {
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
      if (!utils.isByteAddr(operands[0])) {
        result = { status: false, msg: 'Invalid operand' };
      } else if (utils.isLabel(operands[1])) {
        result = { status: false, msg: 'Invalid label' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['jb', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      if (!utils.isByteAddr(operands[0])) {
        result = { status: false, msg: 'Invalid operand' };
      } else if (utils.isLabel(operands[1])) {
        result = { status: false, msg: 'Invalid label' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['jnb', function (operands) {
    let result = { status: true };
    if (operands.length === 2) {
      if (!utils.isByteAddr(operands[0])) {
        result = { status: false, msg: 'Invalid operand' };
      } else if (utils.isLabel(operands[1])) {
        result = { status: false, msg: 'Invalid label' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['jc', function (operands) {
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
  ['jnc', function (operands) {
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
  ['jz', function (operands) {
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
  ['jnz', function (operands) {
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
  ['cjne', function (operands) {
    console.log(operands);
    return { status: true };
  }],
  ['lcall', function (operands) {
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
  ['acall', function (operands) {
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
  ['anl', function (operands) {
    console.log(operands);
    return { status: true };
  }],
  ['orl', function (operands) {
    console.log(operands);
    return { status: true };
  }],
  ['xrl', function (operands) {
    console.log(operands);
    return { status: true };
  }],
  ['rl', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!(parseInt(operands[0], 10) === sfrMap.get('A'))) {
        result = { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['rlc', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!(parseInt(operands[0], 10) === sfrMap.get('A'))) {
        result = { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['rr', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!(parseInt(operands[0], 10) === sfrMap.get('A'))) {
        result = { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['rrc', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!(parseInt(operands[0], 10) === sfrMap.get('A'))) {
        result = { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['da', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!(parseInt(operands[0], 10) === sfrMap.get('A'))) {
        result = { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['swap', function (operands) {
    let result = { status: true };
    if (operands.length === 1) {
      if (!(parseInt(operands[0], 10) === sfrMap.get('A'))) {
        result = { status: false, msg: 'Invalid operand' };
      }
    } else {
      result = { status: false, msg: 'Invalid number of operands' };
    }
    return result;
  }],
  ['xch', function (operands) {
    console.log(operands);
    return { status: true };
  }],
  ['xchd', function (operands) {
    console.log(operands);
    return { status: true };
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
  ['nop', function (operands) {
    if (operands.length === 0) {
      return { status: true };
    }
    return { status: false, msg: 'Invalid number of operands' };
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
