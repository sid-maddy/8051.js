import _ from 'lodash';
import memory from './data';
import utils from './utils';

function mov(addr1, addr2) {
  memory.ram[addr1] = memory.ram[addr2];
}

function add(addr1, addr2) {
  memory.ram[addr1] += memory.ram[addr2];
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
};
