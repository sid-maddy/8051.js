<template>
  <div id="sfr-status">
    <table class="ui compact table">
      <tbody>
        <tr v-for="item in sfrs">
          <td class="center aligned eight wide">{{ item.sfr }}</td>
          <td class="center aligned eight wide">{{ item.value }}</td>
        </tr>
      </tbody>
    </table>
    <!-- <pre>{{ sfrs }}</pre> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      sfrs: [],
      memory: this.$store.state.memory,
    };
  },
  mounted() {
    this.updateSFRs(this.memory);
    this.$store.subscribe((_, state) => this.updateSFRs(state.memory));
  },
  methods: {
    updateSFRs(mem) {
      const temp = [];
      for (const [k, v] of mem.sfrMap) {
        temp.push({ sfr: k, value: `0x${mem.ram[v].toString(16)}` });
      }
      this.sfrs = temp;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
