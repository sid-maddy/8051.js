<template lang="pug">
#editor
  pre#ace-editor {{ code }}
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import ace from 'brace';
import 'brace/theme/tomorrow';
import 'brace/mode/assembly_x86';

export default {
  data() {
    return {
      code: `MOV A, #42
LCALL NEXT
END
NEXT: MOV B, #10
RET`,
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
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
