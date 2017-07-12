<template>
  <div id="app" class="ui four column stackable grid">
    <intro-modal v-if="showModal" @closeModal="showModal = false"></intro-modal>
    <div class="row">
      <div class="middle aligned center aligned column">
        <h2 class="ui header">Pin Diagram</h2>
      </div>
      <div class="middle aligned center aligned column">
        <h2 class="ui header">Memory</h2>
      </div>
      <div class="middle aligned center aligned column">
        <h2 class="ui header">Peripherals</h2>
      </div>
      <div class="middle aligned center aligned column">
        <h2 class="ui header">Editor</h2>
        <div class="ui stackable labels">
          <span class="ui green label">Current line</span>
          <span class="ui blue label">Next line (PC)</span>
          <span class="ui red label">Error line</span>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="column">
        <pin-diagram></pin-diagram>
      </div>
      <div class="column">
        <memory></memory>
      </div>
      <div class="center aligned column">
        <router-view class="ui basic segment"></router-view>
      </div>
      <div class="column">
        <editor></editor>
      </div>
    </div>
  </div>
</template>

<script>
import 'semantic-ui-css/semantic.min.css';

import IntroModal from './components/IntroModal';
import PinDiagram from './components/PinDiagram';
import Memory from './components/Memory';
import Editor from './components/Editor';

export default {
  data() {
    return {
      showModal: true,
    };
  },
  components: {
    IntroModal,
    PinDiagram,
    Memory,
    Editor,
  },
};
</script>

<style lang="scss">
#app {
  margin: 0 0.5em;
}

.highlight-line {
  position: absolute;
  z-index: 2;

  &.current {
    background-color: #b2ff59;
  }

  &.next {
    background-color: #18ffff;
  }

  &.error {
    background-color: #ff5252;
  }
}
</style>
