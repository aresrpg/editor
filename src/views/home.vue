<template lang="pug">
.main__container
  .editor(v-if="can_edit")
    editor-nav
    editor(:key_name="Files.ITEMS")
      template(#default="{ selected }")
        item-editor(v-if="items[selected]" :id="selected")
  start(v-else)
</template>

<script setup>
import { provide, ref, watchEffect } from 'vue';

import start from '../components/start.vue';
import Files from '../Files.js';
import editor from '../components/editor.vue';
import itemEditor from '../components/item-editor.vue';
import entityEditor from '../components/entity-editor.vue';
import editorNav from '../components/nav.vue';
import { stored_reactive, stored_ref } from '../stored.js';

const items = stored_reactive(Files.ITEMS);
const entities = stored_reactive(Files.ENTITIES);
const can_edit = ref(false);

const item_search = ref('');
const entity_search = ref('');
const item_json = stored_ref(`${Files.ITEMS}:json`, false);
const entity_json = stored_ref(`${Files.ENTITIES}:json`, false);

provide(Files.ITEMS, items);
provide(Files.ENTITIES, entities);

provide(`${Files.ITEMS}:search`, item_search);
provide(`${Files.ENTITIES}:search`, entity_search);
provide(`${Files.ITEMS}:json`, item_json);
provide(`${Files.ENTITIES}:json`, entity_json);

const present = obj => !!Object.keys(obj).length;

watchEffect(() => {
  if (present(items) && present(entities)) can_edit.value = true;
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
