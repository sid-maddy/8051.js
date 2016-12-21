<template lang="pug">
#sfr-status
  pre {{ sfrs }}
</template>

<script>
export default {
  data() {
    return {
      sfrs: {},
      memory: this.$store.state.memory,
    };
  },
  mounted() {
    this.updateSFRs(this.memory);
    this.$store.subscribe((_, state) => this.updateSFRs(state.memory));
  },
  methods: {
    updateSFRs(mem) {
      const temp = {};
      for (const [k, v] of mem.sfrMap) {
        temp[k] = `0x${mem.ram[v].toString(16)}`;
      }
      this.sfrs = temp;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
