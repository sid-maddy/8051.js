<template lang="pug">
#app.ui.four.column.stackable.grid
  .row
    .middle.aligned.column
      pin-diagram
    .middle.aligned.column
      seven-segment
    .middle.aligned.column
      sfr-status
    .column
      editor
</template>

<script>
import 'semantic-ui-css/semantic.min.css';

import PinDiagram from 'components/PinDiagram';
import SevenSegment from 'components/SevenSegment';
import SfrStatus from 'components/SfrStatus';
import Editor from 'components/Editor';

export default {
  components: {
    PinDiagram,
    SevenSegment,
    SfrStatus,
    Editor,
  },
};
</script>

<style lang="scss">
#app {
  height: 100%;
}

.currentLine {
  position: absolute;
  background: lightgreen;
  z-index: 100;
}
</style>
