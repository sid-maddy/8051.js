import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';

import App from './App';
import SevenSegment from './components/SevenSegment';
import Motor from './components/Motor';
import AdcDacSlider from './components/AdcDacSlider';

import lib from './lib/8051';

Vue.use(VueRouter);
Vue.use(Vuex);

/* eslint-disable no-new */
const router = new VueRouter({
  routes: [{
    path: '/seven-segment', component: SevenSegment,
  }, {
    path: '/motor', component: Motor,
  }, {
    path: '/adc-dac', component: AdcDacSlider,
  }],
});

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
    setPort(state, [port, value]) {
      // eslint-disable-next-line no-param-reassign
      state.memory.ram[state.memory.sfrMap.get(`P${port}`)] = value;
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
