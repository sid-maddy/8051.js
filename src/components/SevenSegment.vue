<template>
  <div id="seven-segment">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 156 195.6" version="1">
      <g transform="translate(-82 -56.5)">
        <path id="segment6" fill="none" stroke="#000" d="M190.8 72.5 175.6 88h-59L101 72.5 116.7 57h59L191 72.5z"></path>
        <text x="141.7" y="77.1" font-size="12.5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
          <tspan x="141.7" y="77.1">A</tspan>
        </text>
        <path id="segment5" fill="none" stroke="#000" d="M194 75.4l15.5 15.2v45L194 151l-15.5-15.4v-45L194 75.4z"></path>
        <text x="189.5" y="117.8" font-size="12.5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
          <tspan x="189.5" y="117.8">B</tspan>
        </text>
        <path id="segment4" fill="none" stroke="#000" d="M194 157.4l15.5 15.3v45L194 233.2l-15.5-15.5v-45l15.5-15.3z"></path>
        <text x="189.6" y="199.9" font-size="12.5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
          <tspan x="189.6" y="199.9">C</tspan>
        </text>
        <path id="segment3" fill="none" stroke="#000" d="M190.8 236l-15.2 15.6h-59L101 236l15.6-15.4h59l15.2 15.5z"></path>
        <text x="140.9" y="240.6" font-size="12.5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
          <tspan x="140.9" y="240.6">D</tspan>
        </text>
        <path id="segment2" fill="none" stroke="#000" d="M98 157.4l15.5 15.3v45L98 233.2l-15.5-15.5v-45L98 157.4z"></path>
        <text x="93.8" y="199.9" font-size="12.5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
          <tspan x="93.8" y="199.9">E</tspan>
        </text>
        <path id="segment1" fill="none" stroke="#000" d="M98 75.4l15.5 15.2v45L98 151l-15.5-15.4v-45L98 75.4z"></path>
        <text x="94.2" y="117.8" font-size="12.5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
          <tspan x="94.2" y="117.8">F</tspan>
        </text>
        <path id="segment0" fill="none" stroke="#000" d="M190.8 154l-15.2 15.5h-59L101 154l15.6-15.5h59l15.2 15.5z"></path>
        <text x="141.2" y="158.6" font-size="12.5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
          <tspan x="141.2" y="158.6">G</tspan>
        </text>
        <circle cx="225.3" cy="239.3" r="12.3" fill="none" stroke="#000" stroke-linecap="round"></circle>
        <text x="216.3" y="243.8" font-size="12.5" font-family="sans-serif" letter-spacing="0" word-spacing="0">
          <tspan x="216.3" y="243.8">DP</tspan>
        </text>
      </g>
    </svg>
    <select id="port-select" v-model="portNum">
      <option v-for="i in 4" :value="i - 1">Port {{ i - 1 }}</option>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';

export default {
  name: 'Seven-Segment',
  data() {
    return {
      portNum: 0,
    };
  },
  computed: mapGetters([
    'getP0',
    'getP1',
    'getP2',
    'getP3',
  ]),
  mounted() {
    const toBin = this.$store.state.utils.convertToBin;
    this.$store.subscribe(() => {
      const port = toBin(this[`getP${this.portNum}`]());
      _.forEach(_.range(7), (i) => {
        const elt = this.$el.querySelector(`#segment${i}`);
        elt.style.fill = port[7 - i] === '1' ? 'red' : 'none';
      });
    });
  },
};
</script>

<style lang="scss" scoped>
svg {
  width: 100%;
  height: 100%;
}
</style>
