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
  if (memory.ram[addr1] >= 255
    || memory.ram[addr2] >= 255
    || memory.ram[addr1] + memory.ram[addr2] > 255) {
    memory.ram[addr1] = 0;
    setb(`${memory.sfrMap.get('PSW')}.1`);
  } else {
    memory.ram[addr1] += memory.ram[addr2];
    if ((((memory.ram[addr2] & 240) >= 240) && ((memory.ram[addr1] & 240) >= 1))
      || (((memory.ram[addr1] & 240) >= 240) && ((memory.ram[addr2] & 240) >= 1))) {
      setb(`${memory.sfrMap.get('PSW')}.7`);
      memory.ram[addr1] -= 256;
    }

    if ((((memory.ram[addr2] & 15) >= 15) && ((memory.ram[addr1] & 15) >= 1))
      || (((memory.ram[addr1] & 15) >= 15) && ((memory.ram[addr2] & 15) >= 1))) {
      setb(`${memory.sfrMap.get('PSW')}.6`);
    }
  }
}

function subb(addr1, addr2) {
  if (memory.ram[addr1] < memory.ram[addr2]) {
    setb(`${memory.sfrMap.get('PSW')}.7`);
    memory.ram[addr1] = `${(256 + memory.ram[addr1]) - memory.ram[addr2]}`;
  } else {
    memory.ram[addr1] -= memory.ram[addr2];
  }
}

function mul(addr) {
  if (addr.match(/ab/i)) {
    clr(`${memory.sfrMap.get('PSW')}.7`);
    const A = memory.sfrMap.get('A');
    const B = memory.sfrMap.get('B');
    memory.ram[A] *= memory.ram[B];
    memory.ram[B] = 0;
    if (memory.ram[A] > 255) {
      memory.ram[B] = memory.ram[A] - 255;
      memory.ram[A] = 255;
    }
  }
}

function div(addr) {
  if (addr.match(/ab/i)) {
    clr(`${memory.sfrMap.get('PSW')}.7`);
    clr(`${memory.sfrMap.get('PSW')}.1`);
    const A = memory.sfrMap.get('A');
    const B = memory.sfrMap.get('B');
    if (memory.ram[B] === 0) {
      setb(`${memory.sfrMap.get('PSW')}.2`);
      memory.ram[A] = 0;
      memory.ram[B] = 0;
    } else {
      memory.ram[A] = Math.floor(memory.ram[A] / memory.ram[B]);
      memory.ram[B] = memory.ram[A] % memory.ram[B];
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
  add,
  clr,
  setb,
  djnz,
  lcall,
  updateParity,
  subb,
  mul,
  div,
};
