<template lang="pug">
.start__container(v-if="interacted")
  span Welcome in AresRpg's data editor
  span Please locate the #[b(:class="{ valid: present(ARESRPG) }" @click="on_pick_ares") aresrpg/ares-data] and #[b(:class="{ valid: present(RESOURCES) }" @click="on_pick_resources") aresrpg/resourcepacks] folders to start
.please__interact(v-else)
  q-button(@click="interacted = true") Start editing !
</template>

<script setup>
import { inject, ref, watchEffect } from 'vue';
import { get, set } from 'idb-keyval';
import { useToast } from 'vue-toastification';
import { iter } from 'iterator-helper';

import Folders from '../core/Folders.js';
import { grant_permission, parse_directory } from '../core/directories.js';
import { normalize_item } from '../core/items.js';

const ARESRPG = inject(Folders.ARESRPG);
const RESOURCES = inject(Folders.RESOURCES);
const ARESRPG_HANDLE = inject(`${Folders.ARESRPG}:handle`);
const RESOURCES_HANDLE = inject(`${Folders.RESOURCES}:handle`);
const interacted = ref(false);

const toast = useToast();
const present = obj => !!Object.keys(obj).length;

const transform_values = ({ object, transform }) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, transform(value)])
  );

const Folder = {
  aresrpg: {
    key: Folders.ARESRPG,
    validate: ({ 'items.json': items, 'entities.json': entities }) =>
      items && entities,
    handle: (
      { 'items.json': items_json, 'entities.json': entities_json },
      handle
    ) => {
      ARESRPG_HANDLE.value = handle;
      const normalized_items = transform_values({
        object: items_json,
        transform: normalize_item,
      });
      Object.assign(ARESRPG, { entities_json, 'items.json': normalized_items });
    },
  },
  resources: {
    key: Folders.RESOURCES,
    validate: ({ assets: { minecraft = {} } = {} } = {}) =>
      'models' in minecraft,
    handle: (folder, handle) => {
      Object.assign(RESOURCES, folder);
      RESOURCES_HANDLE.value = handle;
    },
  },
};

const on_pick =
  ({ validate, handle, key }) =>
  async () => {
    const directory_handle = await window.showDirectoryPicker();
    if (!directory_handle) return;

    const folder = await parse_directory(directory_handle);
    if (validate(folder)) {
      handle(folder);
      await set(key, directory_handle);
    } else
      toast(`This doesn't seem to be the correct folder 😞`, { type: 'error' });
  };

const on_pick_ares = on_pick(Folder.aresrpg);
const on_pick_resources = on_pick(Folder.resources);

const init_folder = async ({ validate, handle, key }) => {
  const directory_handle = await get(key);
  if (directory_handle) {
    await grant_permission(directory_handle);
    const folder = await parse_directory(directory_handle);
    if (validate(folder)) handle(folder, directory_handle);
  }
};

watchEffect(async () => {
  if (interacted.value)
    await iter(Object.values(Folder)).toAsyncIterator().forEach(init_folder);
});
</script>

<style lang="stylus" scoped>
.start__container, .please__interact
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
