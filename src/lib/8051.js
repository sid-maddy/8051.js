import { isEqual, isNull, split } from 'lodash';
import memory from './data';
import utils from './utils';

let resetMemory = true;
let debugProgramCounterStack = [];

function run(input) {
  utils.initValues(input);
  const executionStatus = utils.handleExecution();
  resetMemory = true;
  return executionStatus;
}

function debug(input) {
  const END = /^\s*(?:([a-z]+)\s*?:)?\s*(?:END)\s*(?:;.*)?$/i;
  const RET = /^\s*(?:([a-z]+)\s*?:)?\s*(?:RET|RETI)\s*(?:;.*)?$/i;
  const CALL = /^\s*(?:[a-z]+\s*?:)?\s*(?:LCALL|ACALL)\s+([a-z]+)\s*(?:;.*)?$/i;

  if (resetMemory || !(isEqual(memory.code, split(input, '\n')))) {
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
    if (!isNull(label)) {
      debugStatus = memory.instructionCheck.get('lcall')(new Array(label[1]));
      if (debugStatus.status) {
        debugProgramCounterStack.push(memory.programCounter);
        memory.programCounter = memory.labels.get(label[1]);
        memory.ram[memory.sfrMap.get('SP')] += 2;
      }
    } else {
      debugStatus = utils.parseLine(memory.code[memory.programCounter - 1]);
    }
  }
  if (memory.programCounter >= memory.code.length) {
    if (debugProgramCounterStack.length > 0 && !resetMemory) {
      debugStatus = { status: false, msg: 'Expected RET statement on the next line' };
    }
    resetMemory = true;
  }
  debugStatus.line = lineNumber;
  if (!debugStatus.status) {
    resetMemory = true;
  }
  return debugStatus;
}

export default {
  debug,
  memory,
  run,
  utils,
};
