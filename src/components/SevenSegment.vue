<template lang="pug">
#seven-segment
  svg(xmlns='http://www.w3.org/2000/svg', viewBox="0 0 156 195.6", version='1')
    g(transform='translate(-82 -56.5)')
      path#segment6(fill='none', stroke='#000', d='M190.8 72.5 175.6 88h-59L101 72.5 116.7 57h59L191 72.5z')
      text(x='141.7', y='77.1', font-size='12.5', font-family='sans-serif', letter-spacing='0', word-spacing='0')
        tspan(x='141.7', y='77.1') A
      path#segment5(fill='none', stroke='#000', d='M194 75.4l15.5 15.2v45L194 151l-15.5-15.4v-45L194 75.4z')
      text(x='189.5', y='117.8', font-size='12.5', font-family='sans-serif', letter-spacing='0', word-spacing='0')
        tspan(x='189.5', y='117.8') B
      path#segment4(fill='none', stroke='#000', d='M194 157.4l15.5 15.3v45L194 233.2l-15.5-15.5v-45l15.5-15.3z')
      text(x='189.6', y='199.9', font-size='12.5', font-family='sans-serif', letter-spacing='0', word-spacing='0')
        tspan(x='189.6', y='199.9') C
      path#segment3(fill='none', stroke='#000', d='M190.8 236l-15.2 15.6h-59L101 236l15.6-15.4h59l15.2 15.5z')
      text(x='140.9', y='240.6', font-size='12.5', font-family='sans-serif', letter-spacing='0', word-spacing='0')
        tspan(x='140.9', y='240.6') D
      path#segment2(fill='none', stroke='#000', d='M98 157.4l15.5 15.3v45L98 233.2l-15.5-15.5v-45L98 157.4z')
      text(x='93.8', y='199.9', font-size='12.5', font-family='sans-serif', letter-spacing='0', word-spacing='0')
        tspan(x='93.8', y='199.9') E
      path#segment1(fill='none', stroke='#000', d='M98 75.4l15.5 15.2v45L98 151l-15.5-15.4v-45L98 75.4z')
      text(x='94.2', y='117.8', font-size='12.5', font-family='sans-serif', letter-spacing='0', word-spacing='0')
        tspan(x='94.2', y='117.8') F
      path#segment0(fill='none', stroke='#000', d='M190.8 154l-15.2 15.5h-59L101 154l15.6-15.5h59l15.2 15.5z')
      text(x='141.2', y='158.6', font-size='12.5', font-family='sans-serif', letter-spacing='0', word-spacing='0')
        tspan(x='141.2', y='158.6') G
      circle(cx='225.3', cy='239.3', r='12.3', fill='none', stroke='#000', stroke-linecap='round')
      text(x='216.3', y='243.8', font-size='12.5', font-family='sans-serif', letter-spacing='0', word-spacing='0')
        tspan(x='216.3', y='243.8') DP
  select#port-select(v-model="portNum")
    option(value="0") Port 0
    option(value="1") Port 1
    option(value="2") Port 2
    option(value="3") Port 3
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';

export default {
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
    this.$store.subscribe(() => {
      const port = this.$store.state.utils.convertToBinary(this[`getP${this.portNum}`]());
      _.forEach(_.range(7), (i) => {
        const elt = this.$el.querySelector(`#segment${i}`);
        if (port[7 - i] === '1') {
          elt.style.fill = 'red';
          elt.nextSibling.style.fill = 'white';
        } else {
          elt.style.fill = 'none';
          elt.nextSibling.style.fill = 'black';
        }
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
