<template>
  <div id="app" class="ui five column stackable grid basic segment">
    <div class="middle aligned column">
      <pin-diagram></pin-diagram>
    </div>
    <div class="middle aligned center aligned column">
      <seven-segment></seven-segment>
    </div>
    <div class="middle aligned column">
      <sfr-status></sfr-status>
    </div>
    <div class="middle aligned center aligned column">
      <motor></motor>
    </div>
    <div class="column">
      <editor></editor>
    </div>
  </div>
</template>

<script>
import 'semantic-ui-css/semantic.min.css';

import PinDiagram from 'components/PinDiagram';
import SevenSegment from 'components/SevenSegment';
import SfrStatus from 'components/SfrStatus';
import Motor from 'components/Motor';
import Editor from 'components/Editor';

export default {
  components: {
    PinDiagram,
    SevenSegment,
    SfrStatus,
    Motor,
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
