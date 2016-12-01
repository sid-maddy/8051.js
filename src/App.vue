<template lang="pug">
#app
  editor
</template>

<script>
import Editor from './components/Editor';

export default {
  components: {
    Editor,
  },
};
</script>

<style lang="scss">
#editor {
  float: right;
}
</style>
