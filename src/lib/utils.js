/* eslint-disable no-console */
import _ from 'lodash';
import memory from './data';
import funcs from './instructions';

let resetMemory = true;

function commentedRegex(strings, ...values) {
  const string = _.chain(strings.raw)
    .map((v, i) => v + (values[i] || ''))
    .join('')
    .value();

  return _.chain(string)
    .replace(/\s+/g, '')
    .replace(/<.*?>/g, '')
    .value();
}

const labelPattern = new RegExp(commentedRegex`
  \s*
  (?:               <Any word or number followed by a colon>
    [a-z\d]+\s*?:   <with any number of spaces between>
  )?
`, 'i');

const instructionPattern = new RegExp(commentedRegex`
  \s*?
  (
    [a-z]{2,5}      <Any word of length between 2 & 5>
  )
  \s*
`, 'i');

const numberRegex = commentedRegex`
  (?:
    [01]+b          <Binary numbers followed by 'b'>
  )
  |
  (?:
    \d+[a-f]*h       <Hexadecimal numbers followed by 'h'>
  )
  |
  (?:
    \d+d?           <Decimal numbers followed by an optional 'd'>
  )
`;

const anyRegisterRegex = commentedRegex`
  [a-z]+[0-7]?      <Any word followed by an optional digit>
  (?:
    \.[0-7]         <followed by an optional dot and digit>
  )?
`;

const operandsPattern = new RegExp(commentedRegex`
(
  (?:
    (?:
      ${numberRegex}
    )
    |
    (?:
      @R[01]        <@ followed by R0 or R1>
    )
    |
    (?:
      ${anyRegisterRegex}
    )
  )
  (?:
    \s*,\s*         <Optional second operand>
    (?:
      (?:
        (?:
          #|\/      <number optionally prefixed with # or />
        )?
        (?:
          ${numberRegex}
        )
      )
      |
      (?:
        @R[01]      <@ followed by R0 or R1>
      )
      |
      (?:
        ${anyRegisterRegex}
      )
    )
  )?
  (?:
    \s*,\s*         <Optional third operand>
    (?:
      [a-z]+\s*?    <which is always a label>
    )
  )?
)?\s*
`, 'i');

const commentPattern = new RegExp(commentedRegex`
  \s*
    (?:
      ;.*           <Anything beginning with ;>
    )
`);

const ignoreLinePattern = new RegExp(commentedRegex`
  ^
    \s*             <Any spaces>
      (?:           <Optional ORG directive which is ignored>
        ORG\s+
        (?:
          ${numberRegex}
        )
      )?
      (?:           <Optional comment>
        ${commentPattern.source}
      )?
    \s*             <Any spaces after ORG or comment>
  $
`, 'i');

const ENDpattern = new RegExp(commentedRegex`
  ^
    ${labelPattern.source}
    \s*
    (?:
      END
    )
    (?:           <Optional comment>
      ${commentPattern.source}
    )?
  $
`, 'i');

// This regex matches all types of instructions with labels and operands.
const codePattern = new RegExp(
  labelPattern.source +
  instructionPattern.source +
  operandsPattern.source +
  new RegExp(/(.*)/).source, // any unexpected characters
  'i',
);

function isInt(str) {
  return (str.indexOf('.') === -1);
}

function isFloat(str) {
  return (str.indexOf('.') !== -1);
}

function isPort(addr) {
  const intAddr = parseInt(addr, 10);
  return (intAddr === memory.sfrMap.get('P0') || intAddr === memory.sfrMap.get('P1') || intAddr === memory.sfrMap.get('P2') || intAddr === memory.sfrMap.get('P3'));
}

function isALU(addr) {
  const intAddr = parseInt(addr, 10);
  return (intAddr === memory.sfrMap.get('A') || intAddr === memory.sfrMap.get('B') || addr === `${memory.sfrMap.get('PSW')}.7`);
}

function isRAM(addr) {
  const intAddr = parseInt(addr, 10);
  return (intAddr >= 0 && intAddr <= 127);
}

function isSFR(addr) {
  const intAddr = parseInt(addr, 10);
  return (intAddr <= 255 && !(isPort(addr)) && !(isALU(addr)) && !(isRAM(addr)));
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
  return (memory.labels.has(label.toLowerCase()));
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

  // eslint-disable-next-line prefer-const
  let [, instruction, operands = [], unexpectedChars] = codePattern.exec(code);

  instruction = _.replace(instruction, /\s+/g, '').toLowerCase();

  // Remove spaces
  operands = _.chain(operands)
    .replace(/\s+/g, '')
    .split(',')
    .value();

  // if extra characters are not comments, they are invalid
  if (unexpectedChars.length > 0 && !commentPattern.test(unexpectedChars)) {
    valid = { status: false, msg: 'Invalid operand(s)' };
  }

  let countOfRegBank = 0;
  let containsA = false;
  _.forEach(operands, (operand, index) => {
    let op = operand;
    if (/^(?:@)?R[0-7]$/i.test(op)) {
      countOfRegBank += 1;
    }
    if (/[\da-f]+h$/i.test(op)) {
      // Convert all hex numbers to decimal
      op = convertToDec(op, /(@|#|\/)?([\da-f]+)h/i, 16);
    } else if (/[01]+b$/i.test(op)) {
      // Convert all binary numbers to decimal
      op = convertToDec(op, /(@|#|\/)?([01]+)b/i, 2);
    } else if (/\d+d$/i.test(op)) {
      // Remove optional D from decimal number
      op = op.slice(0, -1);
    }

    // Replace all registors with their ram addresses (in decimal)
    op = handleRegisters(op);
    // Replace @ with the address and save immediate data at 256 index of RAM
    op = handleAddressingMode(op);

    if (/^224(?:\.[0-7])?$/.test(op)) {
      containsA = true;
    }

    operands[index] = op;
  });

  const instructionCheck = memory.instructionCheck.get(instruction);

  if (valid.status) {
    if (_.isUndefined(instructionCheck)) {
      valid = { status: false, msg: 'Invalid instruction' };
    } else if (countOfRegBank > 1) {
      valid = { status: false, msg: 'Both operands cannot access registor bank simultaneously' };
    } else {
      valid = instructionCheck(operands); // check if operands are allowed for the instruction
    }
  }

  if (valid.status) {
    // Call appropriate function with operands
    const executionError = executeFunctionByName(instruction, funcs, operands);
    if (!_.isUndefined(executionError)) {
      valid = executionError;
    }
    if (containsA) {
      funcs.updateParity();
    }
  }
  return valid;
}

function initMemory() {
  memory.ram.set(new Uint8Array(257));
  memory.ram[memory.sfrMap.get('SP')] = 0x07;
  memory.code = '';
  memory.labels = new Map();
  memory.programCounter = 0;
  memory.programCounterStack = [];
}

function initValues(input) {
  initMemory();
  const code = _.split(input, '\n');

  _.forEach(code, (line, index) => {
    code[index] = _.trim(line);
    let [label] = labelPattern.exec(line); // map labels to line numbers
    if (!_.isUndefined(label) && label !== '') {
      label = _.trim(label.slice(0, -1));
      memory.labels.set(label.toLowerCase(), index);
    }
  });
  memory.code = code;
  resetMemory = false;
}

function executeNextLine(input) {
  if (resetMemory) { // reset before executing next line
    initValues(input);
  }

  const lineNumber = memory.programCounter;
  let executionStatus = { status: true };

  memory.programCounter += 1;
  // stop execution if END assembler directive
  if (ENDpattern.test(memory.code[memory.programCounter - 1])) {
    resetMemory = true;
    memory.programCounter = memory.code.length + 1; // this breaks the handleExecution loop

    // ignore blank line and ORG directive
  } else if (!ignoreLinePattern.test(memory.code[memory.programCounter - 1])) {
    executionStatus = parseLine(memory.code[memory.programCounter - 1]);
  }

  // reset if reached end of code or error occured
  if (memory.programCounter >= memory.code.length || !executionStatus.status) {
    resetMemory = true;
  }

  executionStatus.line = lineNumber;
  executionStatus.nextLine = memory.programCounter;
  return executionStatus;
}

function handleExecution(input) {
  initValues(input);
  let executionStatus = { status: true };
  // run until either error occurs or reached end of code
  while (memory.programCounter < memory.code.length && executionStatus.status) {
    executionStatus = executeNextLine(input);
  }
  return executionStatus;
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
  parseLine,
  executeNextLine,
  handleExecution,
  handleRegisters,
  initValues,
  isBitSet,
  translateToBitAddressable,
};
