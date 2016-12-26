import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';

import App from './App';
import SevenSegment from './components/SevenSegment';
import Motor from './components/Motor';

import lib from './lib/8051';

Vue.use(VueRouter);
Vue.use(Vuex);

/* eslint-disable no-new */
const router = new VueRouter({
  routes: [{
    path: '/seven-segment', component: SevenSegment,
  }, {
    path: '/motor', component: Motor,
  }],
});

const store = new Vuex.Store({
  state: {
    memory: lib.memory,
    utils: lib.utils,
  },
  mutations: {
    debug(state, code) {
      Vue.set(state, 'debugResult', lib.debug(code));
    },
    run(state, code) {
      lib.run(code);
    },
  },
});

for (const [k, v] of store.state.memory.sfrMap) {
  store.getters[`get${k}`] = () => store.state.memory.ram[v];
}

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
});
