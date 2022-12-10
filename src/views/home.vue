<template lang="pug">
.main__container
  .editor(v-if="can_edit")
    editor-nav(:editor="selected_editor" @add="() => Editor[selected_editor].add_element()")
    editor(:editor="selected_editor" @deletion="id => Editor[selected_editor].delete_element(id)")
      template(#default="{ selected, set_ref }")
        component(
          :ref="el => set_ref(el)"
          :is="Editor[selected_editor].editor"
          v-if="Editor[selected_editor].content.value[selected]"
          :id="selected"
          @update="value => Editor[selected_editor].update_content(selected, value)"
          @update_set="value => Editor[selected_editor].update_set(selected, value)"
        )
  start(v-else)
</template>

<script setup>
import { provide, ref, watchEffect, reactive } from 'vue'
import { computed } from '@vue/reactivity'
import { useMessageBox } from '@qvant/qui-max'

import { save_file } from '../core/directories'
import start from '../components/start.vue'
import Editors from '../core/Editors.js'
import Folders from '../core/Folders'
import editor from '../components/editor.vue'
import itemEditor from '../components/item-editor.vue'
import entityEditor from '../components/entity-editor.vue'
import editorNav from '../components/nav.vue'
import stored_ref from '../core/stored_ref.js'
import message_input from '../components/message-box-input.vue'
import Textures from '../core/Textures.js'
import { DEFAULT_ITEM } from '../core/items'

const ARESRPG = reactive({})
const RESOURCES = reactive({})

const ARESRPG_HANDLE = ref()
const RESOURCES_HANDLE = ref()

const can_edit = ref(false)
const selected_editor = stored_ref('selected_editor', Editors.ITEMS)
const found_entries_count = ref(0)
const message_box = useMessageBox()

const Editor = {
  [Editors.ITEMS]: {
    editor: itemEditor,
    content: computed(() => ARESRPG?.['items.json']),
    update_content: async (key, value) => {
      ARESRPG['items.json'][key] = value
      await save_file({
        directory_handle: ARESRPG_HANDLE.value,
        file_name: 'items.json',
        file_content: JSON.stringify(ARESRPG['items.json'], null, 2),
        file_path: [],
      })
    },
    update_set: async (key, value) => {
      const set_of_item = Object.entries(ARESRPG['sets.json']).find(
        ([, value]) => value.items.includes(key)
      )
      if (set_of_item) {
        const [set_id] = set_of_item
        ARESRPG['sets.json'][set_id] = value
        await save_file({
          directory_handle: ARESRPG_HANDLE.value,
          file_name: 'sets.json',
          file_content: JSON.stringify(ARESRPG['sets.json'], null, 2),
          file_path: [],
        })
      }
    },
    delete_element: async id => {
      const { custom_model_data, item } = ARESRPG['items.json'][id]
      const { delete_texture } = Textures({
        RESOURCES,
        RESOURCES_HANDLE: RESOURCES_HANDLE.value,
        item,
        item_id: id,
      })
      await delete_texture(custom_model_data)

      delete ARESRPG['items.json'][id]

      await save_file({
        directory_handle: ARESRPG_HANDLE.value,
        file_name: 'items.json',
        file_content: JSON.stringify(ARESRPG['items.json'], null, 2),
        file_path: [],
      })
    },
    add_element: async () => {
      try {
        const { payload } = await message_box(message_input)
        ARESRPG['items.json'][payload] = DEFAULT_ITEM
      } catch {}
    },
  },
  [Editors.ENTITIES]: {
    editor: entityEditor,
    content: computed(() => ARESRPG?.['entities.json']),
    update_content: (key, value) => {
      ARESRPG['entities.json'][key] = value
    },
  },
}

const item_search = ref('')
const entity_search = ref('')
const item_json = stored_ref(`${Editors.ITEMS}:json`, false)
const entity_json = stored_ref(`${Editors.ENTITIES}:json`, false)
const item_fancy_name = stored_ref(`${Editors.ITEMS}:fancy_name`, false)
const entity_fancy_name = stored_ref(`${Editors.ENTITIES}:fancy_name`, false)
const item_select = stored_ref(`${Editors.ITEMS}:select`)
const entity_select = stored_ref(`${Editors.ENTITIES}:select`)

provide(Folders.ARESRPG, ARESRPG)
provide(Folders.RESOURCES, RESOURCES)
provide(`${Folders.ARESRPG}:handle`, ARESRPG_HANDLE)
provide(`${Folders.RESOURCES}:handle`, RESOURCES_HANDLE)
provide('entries_count', found_entries_count)
provide('selected_editor', selected_editor)

provide(`${Editors.ITEMS}:search`, item_search)
provide(`${Editors.ENTITIES}:search`, entity_search)
provide(`${Editors.ITEMS}:json`, item_json)
provide(`${Editors.ENTITIES}:json`, entity_json)
provide(`${Editors.ITEMS}:fancy_name`, item_fancy_name)
provide(`${Editors.ENTITIES}:fancy_name`, entity_fancy_name)
provide(`${Editors.ITEMS}:select`, item_select)
provide(`${Editors.ENTITIES}:select`, entity_select)

const present = obj => !!Object.keys(obj).length

watchEffect(() => {
  if (present(ARESRPG) && present(RESOURCES)) can_edit.value = true
  else can_edit.value = false
})
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
