import memory from './data';
import utils from './utils';

function run(input) {
  utils.initValues(input);
  utils.handleExecution(memory.programCounter);
  utils.displayRam();
  utils.resetMemory = true;
}

function debug(input) {
  console.log(utils.handleDebugging(input));
}

export default {
  run,
  memory,
  utils,
  debug,
};
