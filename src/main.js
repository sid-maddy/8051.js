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
  },
  mutations: {
    compile(state, code) {
      lib.compile(code);
    },
  },
});

new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App },
});
