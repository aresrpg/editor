<template lang="pug">
.main__container
  .editor(v-if="can_edit")
    editor-nav(:editor="selected_editor")
    editor(:editor="selected_editor")
      template(#default="{ selected }")
        component(
          :is="Editor[selected_editor].editor"
          v-if="Editor[selected_editor].content.value[selected]"
          :id="selected"
          @update="value => Editor[selected_editor].update_content(selected, value)"
        )
  start(v-else)
</template>

<script setup>
import { provide, ref, watchEffect, reactive } from 'vue';
import { computed } from '@vue/reactivity';

import start from '../components/start.vue';
import Editors from '../core/Editors.js';
import Folders from '../core/Folders';
import editor from '../components/editor.vue';
import itemEditor from '../components/item-editor.vue';
import entityEditor from '../components/entity-editor.vue';
import editorNav from '../components/nav.vue';
import stored_ref from '../core/stored_ref.js';

const ARESRPG = reactive({});
const RESOURCES = reactive({});

const ARESRPG_HANDLE = ref();
const RESOURCES_HANDLE = ref();

const can_edit = ref(false);
const selected_editor = stored_ref('selected_editor', Editors.ITEMS);
const found_entries_count = ref(0);

const Editor = {
  [Editors.ITEMS]: {
    editor: itemEditor,
    content: computed(() => ARESRPG.data?.['items.json']),
    update_content: (key, value) => {
      ARESRPG.data['items.json'][key] = value;
    },
  },
  [Editors.ENTITIES]: {
    editor: entityEditor,
    content: computed(() => ARESRPG.data?.['entities.json']),
    update_content: (key, value) => {
      ARESRPG.data['entities.json'][key] = value;
    },
  },
};

const item_search = ref('');
const entity_search = ref('');
const item_json = stored_ref(`${Editors.ITEMS}:json`, false);
const entity_json = stored_ref(`${Editors.ENTITIES}:json`, false);
const item_fancy_name = stored_ref(`${Editors.ITEMS}:fancy_name`, false);
const entity_fancy_name = stored_ref(`${Editors.ENTITIES}:fancy_name`, false);
const item_select = stored_ref(`${Editors.ITEMS}:select`);
const entity_select = stored_ref(`${Editors.ENTITIES}:select`);

provide(Folders.ARESRPG, ARESRPG);
provide(Folders.RESOURCES, RESOURCES);
provide(`${Folders.ARESRPG}:handle`, ARESRPG_HANDLE);
provide(`${Folders.RESOURCES}:handle`, RESOURCES_HANDLE);
provide('entries_count', found_entries_count);
provide('selected_editor', selected_editor);

provide(`${Editors.ITEMS}:search`, item_search);
provide(`${Editors.ENTITIES}:search`, entity_search);
provide(`${Editors.ITEMS}:json`, item_json);
provide(`${Editors.ENTITIES}:json`, entity_json);
provide(`${Editors.ITEMS}:fancy_name`, item_fancy_name);
provide(`${Editors.ENTITIES}:fancy_name`, entity_fancy_name);
provide(`${Editors.ITEMS}:select`, item_select);
provide(`${Editors.ENTITIES}:select`, entity_select);

const present = obj => !!Object.keys(obj).length;

watchEffect(() => {
  if (present(ARESRPG) && present(RESOURCES)) can_edit.value = true;
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
