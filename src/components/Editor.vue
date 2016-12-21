<template lang="pug">
#editor
  pre#ace-editor {{ code }}
  button#compile-btn.ui.positive.button Compile
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import ace from 'brace';
import 'brace/theme/tomorrow';
import 'brace/mode/assembly_x86';

export default {
  data() {
    return {
      code: 'MOV P0, #7Fh',
    };
  },
  mounted() {
    const editor = ace.edit(this.$el.querySelector('#ace-editor'));
    editor.getSession().setMode('ace/mode/assembly_x86');
    editor.setTheme('ace/theme/tomorrow');
    editor.commands.addCommand({
      name: 'compile',
      bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
      exec: e => this.compile(e.getValue()),
      readOnly: true,
    });
    this.$el.querySelector('#compile-btn')
      .addEventListener('click', () => {
        this.compile(editor.getValue());
      });
    editor.focus();
  },
  computed: mapState([
    'memory',
  ]),
  methods: mapMutations([
    'compile',
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

#compile-btn {
  position: absolute;
  bottom: 0;
}
</style>
