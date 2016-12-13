/* eslint-disable no-console */
import memory from './data';
import utils from './utils';

function mov(addr1, addr2) {
  memory.ram[addr1] = memory.ram[addr2];
}

function add(addr) {
  memory.ram[224] += memory.ram[addr];
}

function setb(bit) {
  const [addrPart, bitPart] = utils.translateToBitAddressable(bit);
  const decimal = bitPart;
  let binary = (`000000000${memory.ram[addrPart].toString(2)}`).substr(-8);
  binary = `${binary.substring(0, 7 - decimal)}1${binary.substring(8 - decimal)}`;
  memory.ram[addrPart] = parseInt(binary, 2);
}

function clr(bit) {
  const [addrPart, bitPart] = utils.translateToBitAddressable(bit);
  if (bitPart === undefined) {
    memory.ram[addrPart] = 0;
    return;
  }

  const decimal = bitPart;
  let binary = (`000000000${memory.ram[addrPart].toString(2)}`).substr(-8);
  binary = `${binary.substring(0, 7 - decimal)}0${binary.substring(8 - decimal)}`;
  memory.ram[addrPart] = parseInt(binary, 2);
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
  const acc = (`000000000${memory.ram[224].toString(2)}`).substr(-8);
  if ((acc.match(/1/) || []).length % 2 === 0) {
    clr('208.0');
  } else {
    setb('208.0');
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
