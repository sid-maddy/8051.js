import _ from 'lodash';
import memory from './data';
import utils from './utils';

let resetMemory = true;
let debugProgramCounterStack = [];

function run(input) {
  utils.initValues(input);
  const executionStatus = utils.handleExecution();
  utils.displayRam();
  resetMemory = true;
  console.log(executionStatus);
  return executionStatus;
}

function debug(input) {
  const END = /^\s*(?:([a-z]+)\s*?:)?\s*(?:END)\s*(?:;.*)?$/i;
  const RET = /^\s*(?:([a-z]+)\s*?:)?\s*(?:RET|RETI)\s*(?:;.*)?$/i;
  const CALL = /^\s*(?:[a-z]+\s*?:)?\s*(?:LCALL|ACALL)\s+([a-z]+)\s*(?:;.*)?$/i;

  if (resetMemory || !(_.isEqual(memory.code, _.split(input, '\n')))) {
    utils.initValues(input);
    resetMemory = false;
    debugProgramCounterStack = [];
  }
  const lineNumber = memory.programCounter;
  let debugStatus = { status: true };
  memory.programCounter += 1;
  if (END.test(memory.code[memory.programCounter - 1])) {
    resetMemory = true;
  } else if (RET.test(memory.code[memory.programCounter - 1])) {
    if (debugProgramCounterStack.length > 0) {
      memory.programCounter = debugProgramCounterStack.pop();
      memory.ram[memory.sfrMap.get('SP')] -= 2;
    } else {
      debugStatus = { status: false, msg: 'Not a subroutine call' };
      resetMemory = true;
    }
  } else {
    const label = CALL.exec(memory.code[memory.programCounter - 1]);
    if (!_.isNull(label)) {
      debugStatus = memory.instructionCheck.get('lcall')(label[1]);
      if (debugStatus.status) {
        debugProgramCounterStack.push(memory.programCounter);
        memory.programCounter = memory.labels.get(label[1]);
        memory.ram[memory.sfrMap.get('SP')] += 2;
      }
    } else {
      debugStatus = utils.parseLine(memory.code[memory.programCounter - 1]);
    }
  }
  utils.displayRam();
  if (memory.programCounter >= memory.code.length) {
    resetMemory = true;
  }
  debugStatus.line = lineNumber;
  console.log(debugStatus);
  return debugStatus;
}

export default {
  debug,
  memory,
  run,
  utils,
};
