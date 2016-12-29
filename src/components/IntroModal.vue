<template>
  <div id="intro-modal" class="ui active small modal">
    <div class="header">Important Note</div>
    <div class="content">
      <p>
        This simulator does not support Timer and Serial programs.
        So, registers related to those programs will not work as expected.
        They are treated as normal registers.
      </p>
      <pre><code>HERE: JNB P0.0 HERE</code></pre>
      <p>
        Infinitely looping code, such as the one above, which relies on external input(s) to
        break the loop <strong>will</strong> hang the site, prompting you to reload the site.
      </p>
      <p>
        <span class="ui green label">Last executed line</span>
        <span class="ui blue label">Next line to be executed (Program Counter)</span>
        <span class="ui red label">Errored line</span>
      </p>
    </div>
    <div class="actions">
      <div class="ui positive button" @click="closeModal">OK</div>
    </div>
  </div>
</template>

<script>
import { includes } from 'lodash';

export default {
  methods: {
    closeModal() {
      document.cookie = 'firstVisit=false; path=/';
      this.$emit('closeModal');
    },
  },
  mounted() {
    if (includes(document.cookie, 'firstVisit')) {
      this.closeModal();
    }
  },
};
</script>

<style scoped>
#intro-modal {
  top: 1em;
}
</style>
