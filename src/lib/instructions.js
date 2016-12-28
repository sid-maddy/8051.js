/* eslint-disable no-bitwise */
/* eslint no-cond-assign: [2, "except-parens"] */
import {
  countBy,
  floor,
  isUndefined,
  map,
  parseInt as int,
  toArray,
} from 'lodash';
import memory from './data';
import utils from './utils';

function setb(bitAddr) {
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  const binary = utils.changeBit(addr, bit, 1);
  memory.ram[addr] = int(binary, 2);
}

function clr(bitAddr) {
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  if (isUndefined(bit)) {
    memory.ram[addr] = 0;
  } else {
    const binary = utils.changeBit(addr, bit, 0);
    memory.ram[addr] = int(binary, 2);
  }
}

function mov(addr1, addr2) {
  const carry = `${memory.sfrMap.get('PSW')}.7`;
  let [byteAddr1, bit1] = [memory.sfrMap.get('PSW'), 7];
  let [byteAddr2, bit2] = utils.translateToBitAddressable(addr2);
  if ((addr1 === carry) || (
      (addr2 === carry) &&
      ([byteAddr2, bit2] = [memory.sfrMap.get('PSW'), 7]) &&
      ([byteAddr1, bit1] = utils.translateToBitAddressable(addr1))
    )) {
    if (utils.isBitSet(byteAddr2, bit2)) {
      setb(`${byteAddr1}.${bit1}`);
    } else {
      clr(`${byteAddr1}.${bit1}`);
    }
  } else {
    memory.ram[addr1] = memory.ram[addr2];
  }
}

function cpl(bitAddr) {
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  if (isUndefined(bit)) {
    memory.ram[addr] = 255 - memory.ram[addr];
  } else if (utils.isBitSet(addr, bit)) {
    clr(bitAddr);
  } else {
    setb(bitAddr);
  }
}

function add(addr1, addr2) {
  const [num1, num2] = map([addr1, addr2], addr => memory.ram[addr]);
  const [nib1, nib2] = map([num1, num2], num =>
    int(utils.convertToBin(num).slice(4), 2));
  const psw = memory.sfrMap.get('PSW');

  if (nib1 + nib2 > 15) {
    setb(`${psw}.6`);
  } else {
    clr(`${psw}.6`);
  }

  if (num1 + num2 > 255) {
    setb(`${psw}.2`);
    setb(`${psw}.7`);
  } else {
    clr(`${psw}.2`);
    clr(`${psw}.7`);
  }

  memory.ram[addr1] = num1 + num2;
}

function addc(addr1, addr2) {
  memory.ram[addr1] += utils.isBitSet(memory.sfrMap.get('PSW'), 7) ? 1 : 0;
  add(addr1, addr2);
}

function subb(addr1, addr2) {
  const [num1, num2] = map([addr1, addr2], addr => memory.ram[addr]);
  const [nib1, nib2] = map([num1, num2], num =>
    int(utils.convertToBin(num).slice(4), 2));
  const psw = memory.sfrMap.get('PSW');

  let minuend = num1;
  if (nib1 < nib2) {
    setb(`${psw}.6`);
    minuend += 16;
  } else {
    clr(`${psw}.6`);
  }

  if (num1 < num2) {
    setb(`${psw}.7`);
    minuend += 256;
  } else {
    clr(`${psw}.7`);
  }

  memory.ram[addr1] = minuend - (utils.isBitSet(psw, 7) ? 1 : 0) - num2;
}

// eslint-disable-next-line no-unused-vars
function mul(addr) {
  const psw = memory.sfrMap.get('PSW');
  const a = memory.sfrMap.get('A');
  const b = memory.sfrMap.get('B');
  const product = memory.ram[a] * memory.ram[b];

  clr(`${psw}.7`);
  if (product > 255) {
    const binary = utils.convertToBin(product, 16);
    setb(`${psw}.2`);
    memory.ram[a] = int(binary.slice(8), 2);
    memory.ram[b] = int(binary.slice(0, 8), 2);
  } else {
    clr(`${psw}.2`);
    memory.ram[a] = product;
    memory.ram[b] = 0;
  }
}

// eslint-disable-next-line no-unused-vars
function div(addr) {
  const psw = memory.sfrMap.get('PSW');
  const a = memory.sfrMap.get('A');
  const b = memory.sfrMap.get('B');

  clr(`${psw}.7`);
  if (memory.ram[b] === 0) {
    setb(`${psw}.2`);
    memory.ram[a] = 0;
    memory.ram[b] = 0;
  } else {
    clr(`${psw}.2`);
    const quotient = floor(memory.ram[a] / memory.ram[b]);
    const remainder = memory.ram[a] % memory.ram[b];
    memory.ram[a] = quotient;
    memory.ram[b] = remainder;
  }
}

// Jump helper
function jump(label) {
  memory.programCounter = memory.labels.get(label);
}

function ajmp(label) {
  jump(label);
}

function ljmp(label) {
  jump(label);
}

function sjmp(label) {
  jump(label);
}

function djnz(addr, label) {
  memory.ram[addr] -= 1;
  if (memory.ram[addr] > 0) {
    jump(label);
  }
}

function jumpBit(bitAddr, label, ifBitSet, clearBeforeJump) {
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  if (ifBitSet === utils.isBitSet(addr, bit)) {
    if (clearBeforeJump) {
      clr(bitAddr);
    }
    jump(label);
  }
}

function jbc(bitAddr, label) {
  jumpBit(bitAddr, label, true, true);
}

function jb(bitAddr, label) {
  jumpBit(bitAddr, label, true, false);
}

function jnb(bitAddr, label) {
  jumpBit(bitAddr, label, false, false);
}

function jc(label) {
  jb(`${memory.sfrMap.get('PSW')}.7`, label);
}

function jnc(label) {
  jnb(`${memory.sfrMap.get('PSW')}.7`, label);
}

function jz(label) {
  if (memory.ram[memory.sfrMap.get('A')] === 0) {
    jump(label);
  }
}

function jnz(label) {
  if (memory.ram[memory.sfrMap.get('A')] !== 0) {
    jump(label);
  }
}

function cjne(addr1, addr2, label) {
  if (memory.ram[addr1] < memory.ram[addr2]) {
    setb(`${memory.sfrMap.get('PSW')}.7`);
  } else {
    clr(`${memory.sfrMap.get('PSW')}.7`);
  }

  if (memory.ram[addr1] !== memory.ram[addr2]) {
    jump(label);
  }
}

// Call helper
function call(label) {
  const tempProgramCounter = memory.programCounter;
  jump(label);
  memory.ram[memory.sfrMap.get('SP')] += 2;
  const status = utils.handleExecution();
  memory.ram[memory.sfrMap.get('SP')] -= 2;
  memory.programCounter = tempProgramCounter;
  return status;
}

function lcall(label) {
  return call(label);
}

function acall(label) {
  return call(label);
}

function inc(addr) {
  memory.ram[addr] += 1;
}

function dec(addr) {
  memory.ram[addr] -= 1;
}

function nop() {
  // Does this do anything? NOPe!
}

function updateParity() {
  const acc = utils.convertToBin(memory.ram[memory.sfrMap.get('A')]);
  if ((countBy(toArray(acc))['1'] || 0) % 2 === 0) {
    clr(`${memory.sfrMap.get('PSW')}.0`);
  } else {
    setb(`${memory.sfrMap.get('PSW')}.0`);
  }
}

function rotateA(addr, right, withCarry) {
  const originalA = utils.convertToBin(memory.ram[memory.sfrMap.get('A')]);
  let C;
  let rotatedA;
  if (utils.isBitSet(memory.sfrMap.get('PSW'), 7)) {
    C = '1';
  } else {
    C = '0';
  }

  if (right) {
    if (withCarry) {
      rotatedA = `${C}${originalA.slice(0, 7)}`;
      if (originalA.slice(-1) === '1') {
        setb(`${memory.sfrMap.get('PSW')}.7`);
      } else {
        clr(`${memory.sfrMap.get('PSW')}.7`);
      }
    } else {
      rotatedA = `${originalA.slice(-1)}${originalA.slice(0, 7)}`;
    }
  } else if (withCarry) {
    rotatedA = `${originalA.slice(1, 8)}${C}`;
    if (originalA.slice(0, 1) === '1') {
      setb(`${memory.sfrMap.get('PSW')}.7`);
    } else {
      clr(`${memory.sfrMap.get('PSW')}.7`);
    }
  } else {
    rotatedA = `${originalA.slice(1, 8)}${originalA.slice(0, 1)}`;
  }

  memory.ram[memory.sfrMap.get('A')] = parseInt(rotatedA, 2);
}

function rr(addr) {
  rotateA(addr, true, false);
}

function rrc(addr) {
  rotateA(addr, true, true);
}

function rl(addr) {
  rotateA(addr, false, false);
}

function rlc(addr) {
  rotateA(addr, false, true);
}

// eslint-disable-next-line no-unused-vars
function swap(addr) {
  const A = utils.convertToBin(memory.ram[memory.sfrMap.get('A')]);
  const lowerNibble = A.slice(4);
  const higherNibble = A.slice(0, 4);
  memory.ram[memory.sfrMap.get('A')] = parseInt(`${lowerNibble}${higherNibble}`, 2);
}

function push(addr) {
  const SP = memory.sfrMap.get('SP');
  memory.ram[SP] += 1;
  memory.ram[memory.ram[SP]] = memory.ram[addr];
}

function pop(addr) {
  const SP = memory.sfrMap.get('SP');
  memory.ram[addr] = memory.ram[memory.ram[SP]];
  memory.ram[SP] -= 1;
}

function xchd(addr1, addr2) {
  if (parseInt(addr1, 10) === memory.sfrMap.get('A')) {
    const A = utils.convertToBin(memory.ram[memory.sfrMap.get('A')]);
    const binaryOfAddr2 = utils.convertToBin(memory.ram[addr2]);
    const lNibA = A.slice(4);
    const hNibA = A.slice(0, 4);
    const lNibAddr2 = binaryOfAddr2.slice(4);
    const hNibAddr2 = binaryOfAddr2.slice(0, 4);
    memory.ram[memory.sfrMap.get('A')] = parseInt(`${hNibA}${lNibAddr2}`, 2);
    memory.ram[addr2] = parseInt(`${hNibAddr2}${lNibA}`, 2);
  }
}

function xch(addr1, addr2) {
  if (parseInt(addr1, 10) === memory.sfrMap.get('A')) {
    const temp = memory.ram[addr1];
    memory.ram[addr1] = memory.ram[addr2];
    memory.ram[addr2] = temp;
  }
}

// eslint-disable-next-line no-unused-vars
function da(addr) {
  const A = memory.sfrMap.get('A');
  const PSW = memory.sfrMap.get('PSW');
  const lNibA = parseInt(utils.convertToBin(memory.ram[A]).slice(4), 2);
  const hNibA = parseInt(utils.convertToBin(memory.ram[A]).slice(0, 4), 2);
  let num = 0;
  if (lNibA > 9 && hNibA > 9) {
    num = 102;
  } else if (lNibA > 9) {
    num = 6;
  } else if (hNibA > 9) {
    num = 96;
  }
  memory.ram[A] += num;
  if (memory.ram[A] > 153) {
    setb(`${PSW}.7`);
  } else {
    clr(`${PSW}.7`);
  }
}

function anl(addr1, addr2) {
  const [byteAddr1, bit1] = utils.translateToBitAddressable(addr1);
  if (isUndefined(bit1)) {
    memory.ram[addr1] &= memory.ram[addr2];
  } else {
    const [byteAddr2, bit2] = utils.translateToBitAddressable(addr2);
    if (utils.isBitSet(byteAddr1, bit1) && utils.isBitSet(byteAddr2, bit2)) {
      setb(`${byteAddr1}.${bit1}`);
    } else {
      clr(`${byteAddr1}.${bit1}`);
    }
  }
}

function orl(addr1, addr2) {
  const [byteAddr1, bit1] = utils.translateToBitAddressable(addr1);
  if (isUndefined(bit1)) {
    memory.ram[addr1] |= memory.ram[addr2];
  } else {
    const [byteAddr2, bit2] = utils.translateToBitAddressable(addr2);
    if (utils.isBitSet(byteAddr1, bit1) || utils.isBitSet(byteAddr2, bit2)) {
      setb(`${byteAddr1}.${bit1}`);
    } else {
      clr(`${byteAddr1}.${bit1}`);
    }
  }
}

function xrl(addr1, addr2) {
  memory.ram[addr1] ^= memory.ram[addr2];
}

export default {
  setb,
  clr,
  mov,
  cpl,
  add,
  addc,
  subb,
  mul,
  div,
  ajmp,
  ljmp,
  sjmp,
  djnz,
  jbc,
  jb,
  jnb,
  jc,
  jnc,
  jz,
  jnz,
  cjne,
  lcall,
  acall,
  anl,
  orl,
  xrl,
  rl,
  rlc,
  rr,
  rrc,
  da,
  swap,
  xch,
  xchd,
  push,
  pop,
  inc,
  dec,
  nop,
  updateParity,
};
