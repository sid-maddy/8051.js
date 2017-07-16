import memory from './data';
import utils from './utils';

function run(input) {
  return utils.handleExecution(input);
}

function debug(input) {
  return utils.executeNextLine(input);
}

function reset(input) {
  utils.initValues(input);
}

export default {
  debug,
  memory,
  run,
  utils,
  reset,
};
