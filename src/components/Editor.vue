<template lang="pug">
#editor
  editor-window(title="Code Editor", width="300", height="600")
    pre#ace-editor {{ code }}
</template>

<script>
import { EditorWindow } from 'vue-windows';

import * as ace from 'brace';
import 'brace/mode/assembly_x86';
import 'brace/theme/tomorrow';

export default {
  data() {
    return {
      code: 'mov A, #42H\n',
    };
  },
  mounted() {
    const editor = ace.edit('ace-editor');
    editor.setTheme('ace/theme/tomorrow');
    editor.getSession().setMode('ace/mode/assembly_x86');
  },
  components: {
    EditorWindow,
  },
};
</script>

<style src="vue-windows/dist/vue-windows.css"></style>
<style scoped>
#ace-editor {
  position: absolute;
  top: 0;
  bottom: 0.75em;
  left: 0;
  right: 0;
}
</style>
