import _ from 'lodash';
import memory from './data';
import utils from './utils';

function run(input) {
  utils.initMemory();
  const code = _.split(input, '\n');
  const pattern = /\s*(?:([a-z]+)\s*?:)?/i;

  _.forEach(code, (line, index) => {
    code[index] = _.trim(line);
    const [, label] = pattern.exec(line);
    if (!_.isUndefined(label)) {
      memory.labels.set(label, index);
    }
  });

  memory.code = code;
  utils.handleExecution(memory.programCounter);
  utils.displayRam();
}

export default {
  run,
  memory,
  utils,
};
