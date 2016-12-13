/* eslint-disable no-plusplus */
import memory from './data';
import utils from './utils';

function compile(input) {
  utils.initMemory();
  const code = input.split('\n');
  memory.code = code;
  const pattern = /(\s*[a-z]+\s*:\s*)?/i;
  for (let i = 0; i < code.length; ++i) {
    const temp = pattern.exec(code[i]);
    if (temp[1]) {
      const label = temp[1].replace(/[\s:]/g, '');
      memory.labels.set(label, i);
    }
  }
  utils.handleExecution(memory.programCounter);
  utils.displayRam();
}

export default {
  compile,
  memory,
};
