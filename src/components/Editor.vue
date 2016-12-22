<template lang="pug">
#editor
  pre#ace-editor {{ code }}
  #buttons.ui.buttons
    button#run-btn.ui.green.button Run
    .or
    btn#debug-btn.ui.blue.button Debug
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import ace from 'brace';
import 'brace/theme/tomorrow';
import 'brace/mode/assembly_x86';

export default {
  data() {
    return {
      code: '',
    };
  },
  mounted() {
    const editor = ace.edit(this.$el.querySelector('#ace-editor'));
    editor.getSession().setMode('ace/mode/assembly_x86');
    editor.setTheme('ace/theme/tomorrow');
    editor.commands.addCommand({
      name: 'run',
      bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
      exec: e => this.run(e.getValue()),
      readOnly: true,
    });
    editor.commands.addCommand({
      name: 'debug',
      bindKey: { win: 'Ctrl-Shift-Enter', mac: 'Command-Shift-Enter' },
      exec: e => this.debug(e.getValue()),
      readOnly: true,
    });
    this.$el.querySelector('#run-btn')
      .addEventListener('click', () => {
        this.run(editor.getValue());
      });
    this.$el.querySelector('#debug-btn')
      .addEventListener('click', () => {
        this.debug(editor.getValue());
      });
    editor.focus();
  },
  computed: mapState([
    'memory',
  ]),
  methods: mapMutations([
    'run',
    'debug',
  ]),
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
  bottom: 0;
}
</style>
