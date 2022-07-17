<template lang="pug">
.start__container
  span Welcome in AresRpg's data editor
  span Please locate the #[b(:class="{ valid: present(Data[Files.ITEMS].object) }" @click="() => on_pick(Files.ITEMS)") items.json] and #[b(:class="{ valid: present(Data[Files.ENTITIES].object) }" @click="() => on_pick(Files.ENTITIES)") entities.json] files to start
</template>

<script setup>
import { inject } from 'vue';

import Files from '../Files.js';
import normalize_item from '../../normalize_item.js';

const Data = {
  [Files.ITEMS]: {
    fields: ['name', 'item', 'type'],
    object: inject(Files.ITEMS),
    normalize: normalize_item,
  },
  [Files.ENTITIES]: {
    fields: ['minecraft_entity', 'category', 'display_name'],
    object: inject(Files.ENTITIES),
    normalize: x => x,
  },
};

const present = obj => !!Object.keys(obj).length;

const assign_content = ({ key, file_content = {} }) => {
  const { fields, object, normalize } = Data[key];
  const normalized = Object.fromEntries(
    Object.entries(file_content).map(([key, value]) => [key, normalize(value)])
  );
  if (
    Object.values(normalized).every(object =>
      fields.every(field => field in object)
    )
  ) {
    Object.assign(object, normalized);
  } else alert(`Wrong file structure, this is not ${key}.json`);
};

const on_pick = async key => {
  const uploaded = await window
    .showOpenFilePicker()
    .then(([file_handle]) => file_handle.getFile())
    .then(file => file.text());

  try {
    const file_content = JSON.parse(uploaded);
    assign_content({ key, file_content });
  } catch (error) {
    console.error(error);
  }
};
</script>

<style lang="stylus" scoped>
.start__container
  width 100%
  height 70%
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
