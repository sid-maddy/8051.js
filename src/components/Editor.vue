<template>
  <div id="editor">
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
      marker: 0,
    };
  },
  mounted() {
    const editor = ace.edit(this.$el.querySelector('#ace-editor'));
    editor.getSession().setMode('ace/mode/assembly_x86');
    editor.setTheme('ace/theme/tomorrow');
    editor.commands.addCommand({
      name: 'run',
      bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
      exec: e => this.runEditor(e),
      readOnly: true,
    });
    editor.commands.addCommand({
      name: 'debug',
      bindKey: { win: 'Ctrl-Shift-Enter', mac: 'Command-Shift-Enter' },
      exec: e => this.debugEditor(e),
      readOnly: true,
    });
    this.$el.querySelector('#run-btn')
      .addEventListener('click', () => {
        this.runEditor(editor);
      });
    this.$el.querySelector('#debug-btn')
      .addEventListener('click', () => {
        this.debugEditor(editor);
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
    runEditor(editor) {
      this.run(editor.getValue());
    },
    debugEditor(editor) {
      this.debug(editor.getValue());
      const result = this.$store.state.debugResult;
      if (result.status) {
        editor.getSession().removeMarker(this.marker);
        this.marker = editor.getSession().addMarker(
          new Range(result.line, 0, result.line, 1),
          'currentLine',
          'fullLine',
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
