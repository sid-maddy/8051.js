<template>
  <div id="adc-dac" class="ui padded basic segment">
    <input type="number" id="posVref" v-model.number="posVref" />
    <input type="range" id="adc-dac-range" max="255" :step="255 / effVref" v-model.number="portValue" />
    <input type="number" id="vin" :min="negVref" :max="posVref" v-model.number="vin" />
    <input type="number" id="negVref" v-model.number="negVref" />
    <select id="port-select" v-model="portNum">
      <option v-for="i in 4" :value="i - 1">Port {{ i - 1 }}</option>
    </select>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import { round } from 'lodash';

export default {
  name: 'ADC-DAC',
  data() {
    return {
      negVref: 0,
      portNum: 0,
      portValue: 0,
      posVref: 5,
      vin: 0,
    };
  },
  computed: {
    ...mapGetters([
      'getP0',
      'getP1',
      'getP2',
      'getP3',
    ]),
    effVref() {
      return this.posVref - this.negVref;
    },
  },
  watch: {
    portValue(value) {
      this.vin = (value * (this.effVref / 255)) + this.negVref;
      this.setPort([this.portNum, round(value)]);
    },
    vin(value) {
      this.portValue = (value - this.negVref) * (255 / this.effVref);
    },
  },
  methods: mapMutations(['setPort']),
  mounted() {
    this.$store.subscribe((mutation) => {
      if (mutation.type !== 'setPort') {
        const port = this[`getP${this.portNum}`]();
        this.portValue = (port * 100) / 255;
      }
    });
  },
};
</script>

<style lang="scss">
#adc-dac-range {
  margin-top: 7.5em;
  transform: rotate(270deg);
}

#vin {
  width: 5em;
  margin-left: 7.5em;
}

#negVref {
  margin-top: 5.5em;
}

#port-select {
  margin-top: 1em;
}
</style>
