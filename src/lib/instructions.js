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

function djnz(addr, label) {
  memory.ram[addr] -= 1;
  if (memory.ram[addr] > 0) {
    memory.programCounter = memory.labels.get(label);
  }
}

function lcall(label) {
  const tempProgramCounter = memory.programCounter;
  memory.programCounter = memory.labels.get(label);
  utils.handleExecution(memory.programCounter);
  memory.programCounter = tempProgramCounter;
}

function updateParity() {
  const acc = utils.convertToBinary(memory.ram[memory.sfrMap.get('A')]);
  if (_.countBy(_.toArray(acc))['1'] || 0 % 2 === 0) {
    clr(`${memory.sfrMap.get('PSW')}.0`);
  } else {
    setb(`${memory.sfrMap.get('PSW')}.0`);
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
  updateParity,
};