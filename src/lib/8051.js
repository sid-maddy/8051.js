import memory from './data';
import utils from './utils';

function run(input) {
  utils.initValues(input);
  utils.handleExecution(memory.programCounter);
  utils.displayRam();
  utils.resetMemory = true;
}

function debug(input) {
  return utils.handleDebug(input);
}

export default {
  debug,
  memory,
  run,
  utils,
};
