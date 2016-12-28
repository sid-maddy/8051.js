<template>
  <div id="memory" class="ui stackable grid">
    <div class="eight wide column">
      <table id="sfrTable" class="ui small compact center aligned table">
        <thead>
          <tr>
            <th>SFR</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sfrs">
            <td>{{ item.sfr }}</td>
            <td>{{ toHex(item.value) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="eight wide column">
      <table id="ramTable" class="ui small compact center aligned table">
        <thead>
          <tr>
            <th>Location</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in memory.ram.slice(0, 128)">
            <td>{{ toHex(index) }}</td>
            <td>{{ toHex(item) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { padStart, parseInt } from 'lodash';

export default {
  data() {
    return {
      sfrs: [],
    };
  },
  computed: mapState(['memory']),
  mounted() {
    this.updateMemory(this.memory);
    this.$store.subscribe((_, state) => this.updateMemory(state.memory));
  },
  methods: {
    toHex(value) {
      return `0x${padStart(parseInt(value).toString(16), 2, '0')}`;
    },
    updateMemory(mem) {
      const temp = [];
      for (const [k, v] of mem.sfrMap) {
        temp.push({ sfr: k, value: mem.ram[v] });
      }
      this.sfrs = temp;
    },
  },
};
</script>
