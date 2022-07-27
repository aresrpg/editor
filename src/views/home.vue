<template lang="pug">
.main__container
  .editor(v-if="can_edit")
    editor-nav(:key_name="selected_editor")
    editor(:key_name="selected_editor")
      template(#default="{ selected }")
        component(
          :is="Editors[selected_editor].editor"
          v-if="Editors[selected_editor].content[selected]"
          :id="selected"
          @update="value => Editors[selected_editor].content[selected] = value"
        )
  start(v-else)
</template>

<script setup>
import { provide, ref, watchEffect } from 'vue';

import start from '../components/start.vue';
import Files from '../core/Files.js';
import editor from '../components/editor.vue';
import itemEditor from '../components/item-editor.vue';
import entityEditor from '../components/entity-editor.vue';
import editorNav from '../components/nav.vue';
import { stored_reactive, stored_ref } from '../core/stored.js';

const items = stored_reactive(Files.ITEMS);
const entities = stored_reactive(Files.ENTITIES);
const can_edit = ref(false);
const selected_editor = stored_ref('selected_editor', Files.ITEMS);
const found_entries_count = ref(0);

const Editors = {
  [Files.ITEMS]: {
    editor: itemEditor,
    content: items,
  },
  [Files.ENTITIES]: {
    editor: entityEditor,
    content: entities,
  },
};

const item_search = ref('');
const entity_search = ref('');
const item_json = stored_ref(`${Files.ITEMS}:json`, false);
const entity_json = stored_ref(`${Files.ENTITIES}:json`, false);
const item_fancy_name = stored_ref(`${Files.ITEMS}:fancy_name`, false);
const entity_fancy_name = stored_ref(`${Files.ENTITIES}:fancy_name`, false);
const item_select = stored_ref(`${Files.ITEMS}:select`);
const entity_select = stored_ref(`${Files.ENTITIES}:select`);

provide(Files.ITEMS, items);
provide(Files.ENTITIES, entities);
provide('entries_count', found_entries_count);
provide('selected_editor', selected_editor);

provide(`${Files.ITEMS}:search`, item_search);
provide(`${Files.ENTITIES}:search`, entity_search);
provide(`${Files.ITEMS}:json`, item_json);
provide(`${Files.ENTITIES}:json`, entity_json);
provide(`${Files.ITEMS}:fancy_name`, item_fancy_name);
provide(`${Files.ENTITIES}:fancy_name`, entity_fancy_name);
provide(`${Files.ITEMS}:select`, item_select);
provide(`${Files.ENTITIES}:select`, entity_select);

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
    display flex
    flex-flow column nowrap
</style>
