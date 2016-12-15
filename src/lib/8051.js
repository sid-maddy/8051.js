import _ from 'lodash';
import memory from './data';
import utils from './utils';

function compile(input) {
  utils.initMemory();
  const code = _.split(input, '\n');
  memory.code = code;
  const pattern = /([a-z]+)\s*:/i;
  _.forEach(code, (line, index) => {
    const [, label] = pattern.exec(line) || [];
    if (label) {
      memory.labels.set(label, index);
    }
  });
  utils.handleExecution(memory.programCounter);
  utils.displayRam();
}

export default {
  compile,
  memory,
};
