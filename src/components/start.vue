<template lang="pug">
.start__container
  span Welcome in AresRpg's data editor
  span Please locate the #[b(:class="{ valid: present(items) && present(entities) }" @click="on_pick_ares") aresrpg/aresrpg] and #[b(:class="{ valid: present({}) }" @click="on_pick_pack") aresrpg/resourcepacks] folders to start
  three(
    v-if="texture"
    :model_json="json"
    :model_texture_blob="texture"
  )
</template>

<script setup>
import { inject, ref } from 'vue';

import Files from '../core/Files.js';
import read_aresrpg from '../core/read_aresrpg.js';

import three from './three.vue';

const items = inject(Files.ITEMS);
const entities = inject(Files.ENTITIES);

const present = obj => !!Object.keys(obj).length;
const json = ref();
const texture = ref();

const on_pick_pack = async () => {
  await window
    .showOpenFilePicker({ multiple: true })
    .then(async ([json_handle, texture_handle]) => {
      json.value = await json_handle
        .getFile()
        .then(file => file.text())
        .then(text => JSON.parse(text));
      texture.value = await texture_handle.getFile();
    });
  try {
    // const { items: items_content, entities: entities_content } = await window
    //   .showDirectoryPicker()
    //   .then(read_aresrpg);
    // Object.assign(items, items_content);
    // Object.assign(entities, entities_content);
  } catch {}
};

const on_pick_ares = async () => {
  try {
    const { items: items_content, entities: entities_content } = await window
      .showDirectoryPicker()
      .then(read_aresrpg);

    Object.assign(items, items_content);
    Object.assign(entities, entities_content);
  } catch {}
};
</script>

<style lang="stylus" scoped>
.start__container
  width 100vw
  height 100vh
  display flex
  flex-flow column nowrap
  justify-content center
  align-items center
  span
    color #34495E
    b
      cursor pointer
      text-decoration underline
      &.valid
        color #27AE60
</style>
