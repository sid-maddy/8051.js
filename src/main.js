import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';

import lib from './lib/8051';

// Vue logic
Vue.use(Vuex);

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {
    memory: lib.memory,
    utils: lib.utils,
  },
  mutations: {
    compile(state, code) {
      lib.compile(code);
    },
  },
});

store.state.memory.sfrMap.forEach((v, k) => {
  Object.assign(store.getters, { [`get${k}`]() { return store.state.memory.ram[v]; } });
});

new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App },
});
