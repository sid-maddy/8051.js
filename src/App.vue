<template lang="pug">
#app.ui.center.aligned.grid.container
  .row
    .ui.middle.aligned.padded.three.wide.column.container
      pin-diagram
    .ui.middle.aligned.padded.three.wide.column.container
      seven-segment
    .ui.middle.aligned.padded.three.wide.column.container
      motor
    .ui.center.aligned.padded.three.wide.column.container
      editor
</template>

<script>
import 'semantic-ui-css/semantic.min.css';

import Editor from 'components/Editor';
import PinDiagram from 'components/PinDiagram';
import SevenSegment from 'components/SevenSegment';
import Motor from 'components/Motor';

export default {
  components: {
    Editor,
    PinDiagram,
    SevenSegment,
    Motor,
  },
};
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
}
</style>
