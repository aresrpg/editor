<template lang="pug">
.editor__container
  nav
    q-tabs(v-model="active_tab")
      q-tab-pane(:name="Files.ITEMS" :title="Files.ITEMS")
      q-tab-pane(:name="Files.ENTITIES" :title="Files.ENTITIES")
    q-button(@click="clear_storage" theme="secondary" type="icon" icon="q-icon-close")
</template>

<script setup>
import { ref, inject } from 'vue';

import Files from '../Files.js';

const Handler = {
  [Files.ITEMS]: inject(Files.ITEMS),
  [Files.ENTITIES]: inject(Files.ENTITIES),
};

const active_tab = ref(Files.ITEMS);
const clear_storage = () =>
  Object.values(Files).forEach(key => {
    localStorage.removeItem(key);
    Handler[key].value = null;
  });
</script>

<style lang="stylus">
.editor__container
  width 100vw
  height 100vh
  padding 1em
  nav
    display flex

    :last-child
      margin-left auto

    .text
      padding-bottom 1em
      display flex
      flex-flow column nowrap
      span
        color #34495E
        b
          cursor pointer
          text-decoration underline
</style>
