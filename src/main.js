import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';

import lib from './lib/8051';

Vue.use(Vuex);

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    memory: lib.memory,
    utils: lib.utils,
  },
  mutations: {
    debug(state, code) {
      Vue.set(state, 'result', lib.debug(code));
    },
    run(state, code) {
      Vue.set(state, 'result', lib.run(code));
    },
  },
});

for (const [k, v] of store.state.memory.sfrMap) {
  store.getters[`get${k}`] = () => store.state.memory.ram[v];
}

new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App },
});
