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
  } else {
    const binary = utils.changeBit(addr, bit, 0);
    memory.ram[addr] = _.parseInt(binary, 2);
  }
}

function cpl(bitAddr) {
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  if (_.isUndefined(bit)) {
    memory.ram[addr] = 255 - memory.ram[addr];
  } else if (utils.isBitSet(addr, bit)) {
    clr(bitAddr);
  } else {
    setb(bitAddr);
  }
}

function add(addr1, addr2) {
  const [num1, num2] = _.map([addr1, addr2], addr => memory.ram[addr]);
  const [nib1, nib2] = _.map([num1, num2], num =>
    _.parseInt(utils.convertToBinary(num).slice(4), 2));
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
  const [num1, num2] = _.map([addr1, addr2], addr => memory.ram[addr]);
  const [nib1, nib2] = _.map([num1, num2], num =>
    _.parseInt(utils.convertToBinary(num).slice(4), 2));
  const psw = memory.sfrMap.get('PSW');

  let minuend = num1;
  if (nib1 < nib2) {
    setb(`${psw}.6`);
    minuend += 16;
  } else {
    clr(`${psw}.6`);
  }

  if (num1 < num2) {
    setb(`${psw}.2`);
    setb(`${psw}.7`);
    minuend += 256;
  } else {
    clr(`${psw}.2`);
    clr(`${psw}.7`);
  }

  memory.ram[addr1] = minuend - num2;
}

function mul(addr) {
  if (/ab/i.test(addr)) {
    const psw = memory.sfrMap.get('PSW');
    const a = memory.sfrMap.get('A');
    const b = memory.sfrMap.get('B');
    const product = memory.ram[a] * memory.ram[b];

    clr(`${psw}.7`);
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

function div(addr) {
  if (/ab/i.test(addr)) {
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
      memory.ram[a] = _.floor(memory.ram[a] / memory.ram[b]);
      memory.ram[b] = memory.ram[a] % memory.ram[b];
    }
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

function jumpBit(bitAddr, label, ifBitSet) {
  const [addr, bit] = utils.translateToBitAddressable(bitAddr);
  const isBitSet = utils.isBitSet(addr, bit);
  // Shoddy excuse of a XNOR
  if (ifBitSet ? isBitSet : !isBitSet) {
    jump(label);
  }
}

function jbc(bitAddr, label) {
  clr(bitAddr);
  jumpBit(bitAddr, label, true);
}

function jb(bitAddr, label) {
  jumpBit(bitAddr, label, true);
}

function jnb(bitAddr, label) {
  jumpBit(bitAddr, label, false);
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
  utils.handleExecution(memory.programCounter);
  memory.programCounter = tempProgramCounter;
}

function lcall(label) {
  call(label);
}

function acall(label) {
  call(label);
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
  const acc = utils.convertToBinary(memory.ram[memory.sfrMap.get('A')]);
  if ((_.countBy(_.toArray(acc))['1'] || 0) % 2 === 0) {
    clr(`${memory.sfrMap.get('PSW')}.0`);
  } else {
    setb(`${memory.sfrMap.get('PSW')}.0`);
  }
}

export default {
  mov,
  setb,
  clr,
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
  inc,
  dec,
  nop,
  lcall,
  acall,
  updateParity,
};
