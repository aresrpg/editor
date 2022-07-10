<template lang="pug">
.main__container
  editor(v-if="can_edit")
  start(v-else)
</template>

<script setup>
import { provide, ref, watchEffect } from 'vue';

import start from '../components/start.vue';
import editor from '../components/editor.vue';
import Files from '../Files.js';

const items = ref();
const entities = ref();
const can_edit = ref(false);

provide(Files.ITEMS, items);
provide(Files.ENTITIES, entities);

watchEffect(() => {
  if (items.value && entities.value) can_edit.value = true;
  else can_edit.value = false;
});
</script>

<style lang="stylus">
.main__container
  width 100vw
  height 100vh
  background url('../assets/bg.png') center / cover
</style>
