import Vue from 'vue';
import Vuex from 'vuex';
import App from './App';

Vue.use(Vuex);

/* eslint-disable no-new */
const store = new Vuex.Store({
  state: {},
});

new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App },
});
