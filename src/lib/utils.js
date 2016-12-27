/* eslint-disable no-console */
import _ from 'lodash';
import memory from './data';
import funcs from './instructions';

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
  (?:               <Any word followed by a colon>
    [a-z]+\s*?:     <with any number of spaces between>
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
    [\da-f]+h       <Hexadecimal numbers followed by 'h'>
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
)?
`, 'i');

// This regex matches all types of instructions with labels and operands.
// Try it out at http://www.regexr.com/
const codePattern = new RegExp(
  labelPattern.source +
  instructionPattern.source +
  operandsPattern.source,
  'i',
);

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
  if (!/^\s*?$/.test(code)) {
    let [, instruction, operands = []] = codePattern.exec(code);

    instruction = _.replace(instruction, /\s+/g, '');
    console.log(`Instruction = ${instruction}`);

    // Remove spaces
    operands = _.chain(operands)
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

    let containsA = false;
    _.forEach(operands, (op) => {
      if (/^224(?:\.[0-7])?$/.test(op)) {
        containsA = true;
      }
    });

    // Call appropriate function with operands
    executeFunctionByName(instruction.toLowerCase(), funcs, operands);
    if (containsA) {
      funcs.updateParity();
    }
  }
}

function handleExecution() {
  const code = memory.code;
  const pattern = new RegExp(commentedRegex`
    ^
      ${labelPattern}
      \s*
      (?:
        RETI?       <RET or RETI>
        |           <or>
        END         <END>
      )
      \s*
    $
  `, 'i');
  let i = memory.programCounter;
  while (i < code.length) {
    if (pattern.test(code[i])) {
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

  _.forEach(code, (line, index) => {
    code[index] = _.trim(line);
    const [, label] = labelPattern.exec(line);
    if (!_.isUndefined(label)) {
      memory.labels.set(label, index);
    }
  });
  memory.code = code;
}

export default {
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
