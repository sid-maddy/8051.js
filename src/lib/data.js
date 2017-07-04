import utils from './utils';

const sfrMap = new Map([
  ['A', 0xE0],
  ['B', 0xF0],
  ['PSW', 0xD0],
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
]);

const ram = new Uint8Array(257);
ram[sfrMap.get('SP')] = 0x07;

const instructionCheck = new Map([
  ['setb', (operands) => {
    if (operands.length === 1) {
      if (!utils.isBitAddr(operands[0])) {
        return { status: false, msg: 'Invalid operand' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['clr', (operands) => {
    if (operands.length === 1) {
      if (!(utils.isBitAddr(operands[0]) || parseInt(operands[0], 10) === sfrMap.get('A'))) {
        return { status: false, msg: 'Operand must be bit-address OR accumulator' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['mov', (operands) => {
    if (operands.length === 2) {
      if (isNaN(parseInt(operands[0], 10)) || isNaN(parseInt(operands[1], 10))) {
        return { status: false, msg: 'Invalid operands' };
      } else if (operands[0] === `${sfrMap.get('PSW')}.7` || operands[1] === `${sfrMap.get('PSW')}.7`) {
        if (!(utils.isBitAddr(operands[0]) && utils.isBitAddr(operands[1]))) {
          return { status: false, msg: 'Invalid operands' };
        }
      } else if (utils.isRtoR(operands[0], operands[1])) {
        return { status: false, msg: 'Both operands cannot access registor bank simultaneously' };
      } else if (utils.isPortToPort(operands[0], operands[1])) {
        return { status: false, msg: 'Cannot move data from port to port' };
      } else if (utils.isSFRtoSFR(operands[0], operands[1])) {
        return { status: false, msg: 'Both operands cannot be SFRs' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['cpl', operands => instructionCheck.get('clr')(operands)],
  ['add', (operands) => {
    if (operands.length === 2) {
      if (parseInt(operands[0], 10) !== sfrMap.get('A')) {
        return { status: false, msg: '1st operand must be accumulator' };
      } else if (!utils.isByteAddr(operands[1])) {
        return { status: false, msg: 'Invalid 2nd operand' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['addc', operands => instructionCheck.get('add')(operands)],
  ['subb', operands => instructionCheck.get('add')(operands)],
  ['mul', (operands) => {
    if (operands.length === 1) {
      if (!(/^AB$/i.test(operands[0]))) {
        return { status: false, msg: "Operand must be 'AB'" };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['div', operands => instructionCheck.get('mul')(operands)],
  ['ajmp', (operands) => {
    if (operands.length === 1) {
      if (!utils.isLabel(operands[0])) {
        return { status: false, msg: 'Invalid label' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['ljmp', operands => instructionCheck.get('ajmp')(operands)],
  ['sjmp', operands => instructionCheck.get('ajmp')(operands)],
  ['djnz', (operands) => {
    if (operands.length === 2) {
      if (!utils.isByteAddr(operands[0])) {
        return { status: false, msg: 'Invalid 1st operand' };
      }
      if (!utils.isLabel(operands[1])) {
        return { status: false, msg: 'Invalid label' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['jbc', (operands) => {
    if (operands.length === 2) {
      if (!utils.isBitAddr(operands[0])) {
        return { status: false, msg: 'Invalid 1st operand' };
      }
      if (!utils.isLabel(operands[1])) {
        return { status: false, msg: 'Invalid label' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['jb', operands => instructionCheck.get('jbc')(operands)],
  ['jnb', operands => instructionCheck.get('jbc')(operands)],
  ['jc', operands => instructionCheck.get('ajmp')(operands)],
  ['jnc', operands => instructionCheck.get('ajmp')(operands)],
  ['jz', operands => instructionCheck.get('ajmp')(operands)],
  ['jnz', operands => instructionCheck.get('ajmp')(operands)],
  ['cjne', (operands) => {
    if (operands.length === 3) {
      if (parseInt(operands[0], 10) === sfrMap.get('A')) {
        if (!utils.isByteAddr(operands[1])) {
          return { status: false, msg: 'Invalid 2nd operand' };
        }
      } else if (utils.isByteAddr(operands[0])) {
        if (operands[1] !== '256') {
          return { status: false, msg: '2nd operand must be immediate data if 1st operand is not accumulator' };
        }
      } else {
        return { status: false, msg: 'Invalid 1st operand' };
      }
      if (!utils.isLabel(operands[2])) {
        return { status: false, msg: 'Invalid label' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['lcall', operands => instructionCheck.get('ajmp')(operands)],
  ['acall', operands => instructionCheck.get('ajmp')(operands)],
  ['anl', (operands) => {
    if (operands.length === 2) {
      if (operands[0] === `${sfrMap.get('PSW')}.7`) {
        if (!(utils.isBitAddr(operands[1]) || operands[1] === '256.0')) {
          return { status: false, msg: 'Invalid 2nd operand' };
        }
      } else if (parseInt(operands[0], 10) === sfrMap.get('A')) {
        if (!utils.isByteAddr(operands[1])) {
          return { status: false, msg: 'Invalid 2nd operand' };
        }
      } else if (utils.isByteAddr(operands[0])) {
        if (parseInt(operands[1], 10) !== sfrMap.get('A') && operands[1] !== '256') {
          return { status: false, msg: 'Invalid 2nd operand' };
        }
      } else {
        return { status: false, msg: 'Invalid 1st operand' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['orl', operands => instructionCheck.get('anl')(operands)],
  ['xrl', (operands) => {
    if (operands.length === 2) {
      if (!utils.isByteAddr(operands[0])) {
        return { status: false, msg: 'Invalid 1st operand' };
      } else if (!utils.isByteAddr(operands[1])) {
        return { status: false, msg: 'Invalid 2nd operand' };
      } else if (parseInt(operands[0], 10) === sfrMap.get('A')) {
        if (!utils.isByteAddr(operands[1])) {
          return { status: false, msg: 'Invalid 2nd operand' };
        }
      } else if (utils.isByteAddr(operands[0])) {
        if (parseInt(operands[1], 10) !== sfrMap.get('A') && operands[1] !== '256') {
          return { status: false, msg: 'Invalid 2nd operand' };
        }
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['rl', (operands) => {
    if (operands.length === 1) {
      if (parseInt(operands[0], 10) !== sfrMap.get('A')) {
        return { status: false, msg: 'Operand must be accumulator' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['rlc', operands => instructionCheck.get('rl')(operands)],
  ['rr', operands => instructionCheck.get('rl')(operands)],
  ['rrc', operands => instructionCheck.get('rl')(operands)],
  ['da', operands => instructionCheck.get('rl')(operands)],
  ['swap', operands => instructionCheck.get('rl')(operands)],
  ['xch', (operands) => {
    if (operands.length === 2) {
      if (parseInt(operands[0], 10) !== sfrMap.get('A')) {
        return { status: false, msg: '1st operand must be accumulator' };
      } else if (operands[1] === '256') {
        return { status: false, msg: 'Immediate data is not allowed' };
      } else if (!utils.isByteAddr(operands[1])) {
        return { status: false, msg: 'Invalid 2nd operand' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['xchd', (operands) => {
    // the current code is same as 'xch', but xchd accepts limited operands,
    // which we MAY handle later..
    if (operands.length === 2) {
      if (parseInt(operands[0], 10) !== sfrMap.get('A')) {
        return { status: false, msg: '1st operand must be accumulator' };
      } else if (operands[1] === '256') {
        return { status: false, msg: 'Immediate data is not allowed' };
      } else if (!utils.isByteAddr(operands[1])) {
        return { status: false, msg: 'Invalid 2nd operand' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['push', (operands) => {
    // Not sure if this should just call 'inc'
    if (operands.length === 1) {
      if (!utils.isByteAddr(operands[0])) {
        return { status: false, msg: 'Invalid operand' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['pop', operands => instructionCheck.get('push')(operands)],
  ['inc', (operands) => {
    if (operands.length === 1) {
      if (!utils.isByteAddr(operands[0])) {
        return { status: false, msg: 'Invalid operand' };
      }
    } else {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['dec', operands => instructionCheck.get('inc')(operands)],
  ['nop', (operands) => {
    if (operands.length !== 1 || operands[0] !== '') {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['ret', (operands) => {
    if (operands.length !== 1 || operands[0] !== '') {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
  ['reti', (operands) => {
    if (operands.length !== 1 || operands[0] !== '') {
      return { status: false, msg: 'Invalid number of operands' };
    }
    return { status: true };
  }],
]);

export default {
  sfrMap,
  ram,
  instructionCheck,
  code: '',
  labels: new Map(),
  programCounter: 0,
  programCounterStack: [],
};
