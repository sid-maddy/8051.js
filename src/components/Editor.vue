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
    };
  },
  mounted() {
    const editor = ace.edit(this.$el.querySelector('#ace-editor'));
    const editorSession = editor.getSession();
    this.e = editorSession;
    editor.setTheme('ace/theme/tomorrow');
    editorSession.setMode('ace/mode/assembly_x86');
    editor.commands.addCommand({
      name: 'run',
      bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
      exec: () => this.runEditor(),
      readOnly: true,
    });
    editor.commands.addCommand({
      name: 'debug',
      bindKey: { win: 'Ctrl-Shift-Enter', mac: 'Command-Shift-Enter' },
      exec: () => this.debugEditor(),
      readOnly: true,
    });
    this.$el.querySelector('#run-btn')
      .addEventListener('click', () => {
        this.runEditor();
      });
    this.$el.querySelector('#debug-btn')
      .addEventListener('click', () => {
        this.debugEditor();
      });
    editorSession.on('change', () => {
      if (this.marker !== undefined) {
        this.removeMarker();
      }
    });
    editor.focus();

    window.addEventListener('beforeunload', (e) => {
      if (editor.getValue() !== '') {
        e.preventDefault();
      }
    });
  },
  methods: {
    ...mapMutations([
      'run',
      'debug',
    ]),
    runEditor() {
      this.run(this.e.getValue());
      this.highlightLine();
    },
    debugEditor() {
      this.debug(this.e.getValue());
      this.highlightLine();
    },
    highlightLine() {
      this.removeMarker();
      const result = this.$store.state.result;
      if (result.line !== undefined) {
        this.marker = this.e.addMarker(
          new Range(result.line, 0, result.line, Infinity),
          `highlight-line ${result.status ? 'current' : 'error'}`,
          'fullLine',
        );
      }

      if (!result.status) {
        this.showErrorMessage(result.msg, result.line);
      }
    },
    removeMarker() {
      this.e.removeMarker(this.marker);
      delete this.marker;
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
