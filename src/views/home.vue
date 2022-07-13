<template lang="pug">
.main__container
  .editor(v-if="can_edit")
    editor-nav
    item-editor
    entity-editor
  start(v-else)
</template>

<script setup>
import { provide, ref, watchEffect } from 'vue';

import start from '../components/start.vue';
import Files from '../Files.js';
import itemEditor from '../components/item-editor.vue';
import entityEditor from '../components/entity-editor.vue';
import editorNav from '../components/nav.vue';

const items = ref();
const entities = ref();
const can_edit = ref(false);

const item_search = ref('');
const entity_search = ref('');

provide(Files.ITEMS, items);
provide(Files.ENTITIES, entities);

provide(`${Files.ITEMS}:search`, item_search);
provide(`${Files.ENTITIES}:search`, entity_search);

watchEffect(() => {
  if (items.value && entities.value) can_edit.value = true;
  else can_edit.value = false;
});
</script>

<style lang="stylus" scoped>
.main__container
  width 100vw
  height 100vh
  background url('../assets/bg.png') center / cover
  .editor
    width 100vw
    height 100vh
    padding 1em
    padding-bottom 0
    display grid
    grid "nav nav" 50px "left right" 1fr / 1fr 1fr
</style>
