<template>
  <div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 406.8" version="1">
      <g fill="none" stroke="#000">
        <g transform="rotate(-90 82.933 439.114)">
          <circle cx="372" cy="526.2" r="149.5"/>
          <path d="M115.2 695.7H372v-20m-256.8-319H372v19.7"/>
        </g>
        <g id="rotator" stroke-width="10px" transform="translate(-202.047 -376.18)">
          <circle class="motor neutral" cx="372" cy="526.2" r="124" stroke-width=".8"/>
          <path class="motor neutral" d="M379.7 387.5l-15 15 15 15M364.4 635l15 15-15 15"/>
        </g>
      </g>
    </svg>
    <select id="port-pin1-select" v-model="portPinNum1">
      <optgroup v-for="i in 4" :label="'Port ' + (i - 1)">
        <option v-for="j in 8" :value="(i - 1) + ((j - 1) / 10)">Pin P{{ (i - 1) + '.' + (j - 1) }}</option>
      </optgroup>
    </select>
    <select id="port-pin2-select" v-model="portPinNum2">
      <optgroup v-for="i in 4" :label="'Port ' + (i - 1)">
        <option v-for="j in 8" :value="(i - 1) + ((j - 1) / 10)">Pin P{{ (i - 1) + '.' + (j - 1) }}</option>
      </optgroup>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { floor, forEach } from 'lodash';

export default {
  name: 'DC-Motor',
  data() {
    return {
      portPinNum1: 0.0,
      portPinNum2: 0.1,
    };
  },
  computed: {
    ...mapGetters([
      'getP0',
      'getP1',
      'getP2',
      'getP3',
    ]),
    portNum1() {
      return floor(this.portPinNum1);
    },
    portNum2() {
      return floor(this.portPinNum2);
    },
    pinNum1() {
      return floor((this.portPinNum1 % 1).toFixed(1) * 10);
    },
    pinNum2() {
      return floor((this.portPinNum2 % 1).toFixed(1) * 10);
    },
  },
  mounted() {
    const toBin = this.$store.state.utils.convertToBin;
    const rotator = this.$el.querySelector('#rotator');

    this.$store.subscribe(() => {
      // Extract bit value from port, why didn't we do *this* in utils.isBitSet?
      const pin1 = toBin(this[`getP${this.portNum1}`]())[7 - this.pinNum1];
      const pin2 = toBin(this[`getP${this.portNum2}`]())[7 - this.pinNum2];
      let motorClass = '';

      if (pin1 === pin2) {
        motorClass = 'neutral';
      } else if (pin1 === '1' && pin2 === '0') {
        motorClass = 'clockwise';
      } else {
        motorClass = 'counter-clockwise';
      }

      forEach(rotator.children, (child) => {
        child.setAttribute('class', `motor ${motorClass}`);

        // To restart animation, see https://css-tricks.com/restart-css-animation/
        rotator.replaceChild(child.cloneNode(true), child);
      });
    });
  },
};
</script>

<style lang="scss" scoped>
@mixin apply-animation($name) {
  animation-direction: if($name == c, normal, reverse);
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-name: $name;
  animation-timing-function: linear;
}

@mixin rotate-animation($name, $deg) {
  @keyframes #{$name} {
    from {
      transform: rotateX($deg) rotateZ(0deg);
    }

    to {
      transform: rotateX($deg) rotateZ(if($name == c, -360deg, 360deg));
    }
  }
}

.motor {
  // Inner circle's center
  transform-origin: 372px 526.2px;

  &.neutral {
    transform: rotateX(90deg);
  }

  &.clockwise {
    transform: rotateX(180deg);
    @include apply-animation(c)
  }

  &.counter-clockwise {
    transform: rotateX(0deg);
    @include apply-animation(cc)
  }
}

@include rotate-animation(c, 180deg)
@include rotate-animation(cc, 0deg)
</style>
