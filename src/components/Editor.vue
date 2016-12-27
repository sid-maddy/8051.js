<template>
  <div id="editor">
    <div v-if="isError" class="ui negative message">
      <div class="header">
        Error at line {{ lineNumber }}
      </div>
      <p>{{ errorMessage }}</p>
    </div>
    <pre id="ace-editor">{{ code }}</pre>
    <div id="buttons" class="ui buttons">
      <button id="run-btn" class="ui green button">Run</button>
      <div class="or"></div>
      <button id="debug-btn" class="ui blue button">Debug</button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

import ace from 'brace';
import 'brace/theme/tomorrow';
import 'brace/mode/assembly_x86';

const Range = ace.acequire('ace/range').Range;

export default {
  data() {
    return {
      code: '',
      isError: false,
      marker: 0,
    };
  },
  mounted() {
    const editor = ace.edit(this.$el.querySelector('#ace-editor'));
    const editorSession = editor.getSession();
    editor.setTheme('ace/theme/tomorrow');
    editorSession.setMode('ace/mode/assembly_x86');
    editor.commands.addCommand({
      name: 'run',
      bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
      exec: e => this.runEditor(e.getSession()),
      readOnly: true,
    });
    editor.commands.addCommand({
      name: 'debug',
      bindKey: { win: 'Ctrl-Shift-Enter', mac: 'Command-Shift-Enter' },
      exec: e => this.debugEditor(e.getSession()),
      readOnly: true,
    });
    this.$el.querySelector('#run-btn')
      .addEventListener('click', () => {
        this.runEditor(editorSession);
      });
    this.$el.querySelector('#debug-btn')
      .addEventListener('click', () => {
        this.debugEditor(editorSession);
      });
    editor.focus();
  },
  methods: {
    ...mapMutations([
      'run',
      'debug',
    ]),
    runEditor(e) {
      this.run(e.getValue());
      this.highlightLine(e, this.$store.state.result);
    },
    debugEditor(e) {
      this.debug(e.getValue());
      this.highlightLine(e, this.$store.state.result);
    },
    highlightLine(e, result) {
      e.removeMarker(this.marker);
      this.marker = e.addMarker(
        new Range(result.line, 0, result.line, 1),
        `highlight-line ${result.status ? 'current' : 'error'}`,
        'fullLine',
      );

      if (!result.status) {
        this.showErrorMessage(result.msg, result.line);
        setTimeout(() => e.removeMarker(this.marker), 2500);
      }
    },
    showErrorMessage(msg, line) {
      this.isError = true;
      setTimeout(() => { this.isError = false; }, 2000);
      this.errorMessage = msg;
      this.lineNumber = line + 1;
    },
  },
};
</script>

<style lang="scss" scoped>
.message {
  z-index: 100;
}

#ace-editor {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 2.5em;
  right: 0;
}

#buttons {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>
