<template lang="pug">
#app
  pin-diagram
  editor
</template>

<script>
import Editor from './components/Editor';
import PinDiagram from './components/PinDiagram';

export default {
  components: {
    Editor,
    PinDiagram,
  },
};
</script>

<style lang="scss" scoped>
#pin-diagram {
  width: 30%;
  height: 100%;
}

#editor {
  position: absolute;
  top: 0;
  left: 70%;
  width: 30%;
  height: 100%;
}
</style>
