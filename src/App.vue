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
        <select id="component-select" v-model="route">
          <option
            v-for="route in $router.options.routes"
            :value="route.path">
            {{ humanize(route.component.name) }}
          </option>
        </select>
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
import { replace } from 'lodash';

import IntroModal from './components/IntroModal';
import PinDiagram from './components/PinDiagram';
import Memory from './components/Memory';
import Editor from './components/Editor';

export default {
  data() {
    return {
      route: '/seven-segment',
      showModal: true,
    };
  },
  components: {
    IntroModal,
    PinDiagram,
    Memory,
    Editor,
  },
  methods: {
    humanize(name) {
      return replace(name, '-', ' ');
    },
  },
  watch: {
    route(route) {
      this.$router.replace(route);
    },
  },
  created() {
    this.$router.replace(this.route);
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
