/* eslint-disable no-bitwise */
import _ from 'lodash';
import memory from './data';
import utils from './utils';

function mov(addr1, addr2) {
  memory.ram[addr1] = memory.ram[addr2];
}

function setb(bitAddr) {
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  const binary = utils.changeBit(addr, bit, 1);
  memory.ram[addr] = _.parseInt(binary, 2);
}

function clr(bitAddr) {
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  if (_.isUndefined(bit)) {
    memory.ram[addr] = 0;
    return;
  }

  const binary = utils.changeBit(addr, bit, 0);
  memory.ram[addr] = _.parseInt(binary, 2);
}

function add(addr1, addr2) {
  const [num1, num2] = _.map([addr1, addr2], addr => memory.ram[addr]);
  const [nib1, nib2] = _.map([num1, num2], num =>
    _.parseInt(utils.convertToBinary(num).slice(4), 2));
  const psw = memory.sfrMap.get('PSW');

  const isAuxCarry = nib1 + nib2 > 15;
  const isCarry = num1 + num2 > 255;

  if (isAuxCarry) {
    setb(`${psw}.6`);
  } else {
    clr(`${psw}.6`);
  }

  if (isCarry) {
    setb(`${psw}.7`);
  } else {
    clr(`${psw}.7`);
  }

  if (!(isAuxCarry && isCarry)) {
    setb(`${psw}.2`);
  } else {
    clr(`${psw}.2`);
  }

  memory.ram[addr1] = num1 + num2;
}

function addc(addr1, addr2) {
  memory.ram[addr1] += utils.isBitSet(memory.sfrMap.get('PSW'), 7) ? 1 : 0;
  add(addr1, addr2);
}

function subb(addr1, addr2) {
  const [num1, num2] = _.map([addr1, addr2], addr => memory.ram[addr]);
  const [nib1, nib2] = _.map([num1, num2], num =>
    _.parseInt(utils.convertToBinary(num).slice(4), 2));
  const psw = memory.sfrMap.get('PSW');

  const needCarry = num1 < num2;
  const needAuxCarry = nib1 < nib2;
  let minuend = num1;

  if (needAuxCarry) {
    setb(`${psw}.6`);
    minuend += 16;
  } else {
    clr(`${psw}.6`);
  }

  if (needCarry) {
    setb(`${psw}.7`);
    minuend += 256;
  } else {
    clr(`${psw}.7`);
  }

  if (!(needCarry && needAuxCarry)) {
    setb(`${psw}.2`);
  } else {
    clr(`${psw}.2`);
  }

  memory.ram[addr1] = minuend - num2;
}

function mul(addr1, addr2) {
  const a = memory.sfrMap.get('A');
  const b = memory.sfrMap.get('B');
  const psw = memory.sfrMap.get('PSW');
  if (addr1 === a && addr2 === b) {
    clr(`${psw}.7`);
    const product = memory.ram[a] * memory.ram[b];
    if (product > 255) {
      setb(`${psw}.2`);
      memory.ram[b] = product - 255;
      memory.ram[a] = 255;
    } else {
      clr(`${psw}.2`);
      memory.ram[a] = product;
      memory.ram[b] = 0;
    }
  }
}

function div(addr1, addr2) {
  const a = memory.sfrMap.get('A');
  const b = memory.sfrMap.get('B');
  const psw = memory.sfrMap.get('PSW');
  if (addr1 === a && addr2 === b) {
    clr(`${psw}.7`);
    if (memory.ram[b] === 0) {
      setb(`${psw}.2`);
      memory.ram[a] = 0;
      memory.ram[b] = 0;
    } else {
      clr(`${psw}.2`);
      memory.ram[a] = _.floor(memory.ram[a] / memory.ram[b]);
      memory.ram[b] = memory.ram[a] % memory.ram[b];
    }
  }
}

function jump(label) {
  memory.programCounter = memory.labels.get(label);
}

function djnz(addr, label) {
  memory.ram[addr] -= 1;
  if (memory.ram[addr] > 0) {
    jump(label);
  }
}

function call(label) {
  const tempProgramCounter = memory.programCounter;
  memory.programCounter = memory.labels.get(label);
  utils.handleExecution(memory.programCounter);
  memory.programCounter = tempProgramCounter;
}

function lcall(label) {
  call(label);
}

function acall(label) {
  call(label);
}

function updateParity() {
  const acc = utils.convertToBinary(memory.ram[memory.sfrMap.get('A')]);
  if (_.countBy(_.toArray(acc))['1'] || 0 % 2 === 0) {
    clr(`${memory.sfrMap.get('PSW')}.0`);
  } else {
    setb(`${memory.sfrMap.get('PSW')}.0`);
  }
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

function jumpBit(bitAddr, label, ifBit, clear) {
  // ifBit is boolean which decides 'jump if bit' or 'jump if no bit'
  // clear decides wether to clear the bit before jump or not
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  if (!(utils.isBitSet(addr, bit) ^ ifBit)) {
    if (clear) {
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
  jb(`${memory.sfrMap.get('PSW')}.1`, label);
}

function jnz(label) {
  jnb(`${memory.sfrMap.get('PSW')}.1`, label);
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

function nop() {
  // this instruction does nothing.Seriously!
  // http://www.keil.com/support/man/docs/is51/is51_nop.htm
}

function inc(addr) {
  // Don't call ADD function here instead. because INC does not affect any flags.
  memory.ram[addr] = (memory.ram[addr] + 1) % 256; // incrementing after 255 overflows to 0.
}

function dec(addr) {
  // no flags are affected. so don't call SUBB.
  memory.ram[addr] -= 1;
  if (memory.ram[addr] < 0) { // decrementing after 0 underflows to 255.
    memory.ram[addr] = 255;
  }
}

function cpl(bitAddr) {
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  if (_.isUndefined(bit)) { // for CPL A (entire byte cpl)
    memory.ram[addr] = ~memory.ram[addr];
    return;
  }
  if (utils.isBitSet(addr, bit)) {
    clr(bitAddr);
  } else {
    setb(bitAddr);
  }
}

export default {
  mov,
  setb,
  clr,
  add,
  addc,
  subb,
  mul,
  div,
  djnz,
  lcall,
  acall,
  updateParity,
  ajmp,
  ljmp,
  sjmp,
  jbc,
  jb,
  jnb,
  jc,
  jnc,
  jz,
  jnz,
  cjne,
  nop,
  inc,
  dec,
  cpl,
};
