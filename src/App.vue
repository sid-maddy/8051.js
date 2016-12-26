<template>
  <div id="app" class="ui four column stackable grid">
    <div class="middle aligned column">
      <pin-diagram></pin-diagram>
    </div>
    <div class="middle aligned column">
      <sfr-status></sfr-status>
    </div>
    <div class="middle aligned center aligned column">
      <select id="component-select" v-model="route">
        <option v-for="route in $router.options.routes" :value="route.path">{{ humanize(route.component.name) }}</option>
      </select>
      <router-view class="ui basic segment"></router-view>
    </div>
    <div class="column">
      <editor></editor>
    </div>
  </div>
</template>

<script>
import 'semantic-ui-css/semantic.min.css';
import { forEach, replace } from 'lodash';

import PinDiagram from 'components/PinDiagram';
import SfrStatus from 'components/SfrStatus';
import Editor from 'components/Editor';

export default {
  data() {
    return {
      route: '',
    };
  },
  components: {
    PinDiagram,
    SfrStatus,
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
  mounted() {
    forEach(this.$router.options.routes, (v) => {
      console.log(v);
    });
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
