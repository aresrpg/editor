<template lang="pug">
.start__container
  span Welcome in AresRpg's data editor
  span Please locate the #[b(:class="{ valid: Handler[Files.ITEMS].valid.value }" @click="() => on_pick(Files.ITEMS)") items.json] and #[b(:class="{ valid: Handler[Files.ENTITIES].valid.value }" @click="() => on_pick(Files.ENTITIES)") entities.json] files to start
</template>

<script setup>
import { inject, onMounted, ref, watchEffect } from 'vue';

import Files from '../Files.js';

const Handler = {
  [Files.ITEMS]: {
    fields: ['name', 'item', 'type'],
    valid: ref(false),
    data: inject(Files.ITEMS),
  },
  [Files.ENTITIES]: {
    fields: ['minecraft_entity', 'category', 'display_name'],
    valid: ref(false),
    data: inject(Files.ENTITIES),
  },
};

const import_storage = key => {
  try {
    return {
      key,
      file_content: localStorage.getItem(key),
    };
  } catch {}
};

const handle_file_content = ({ key, file_content } = {}) => {
  if (file_content) {
    const { fields, valid, data } = Handler[key];
    try {
      const content = JSON.parse(file_content);
      const content_valid = Object.values(content).every(object =>
        fields.every(field => field in object)
      );
      if (content_valid) {
        valid.value = true;
        data.value = content;
        localStorage.setItem(key, file_content);
        return;
      }
    } catch (error) {
      console.error(error);
    }
    alert(`Wrong file structure, this is not ${key}.json`);
  }
};

const on_pick = async key => {
  handle_file_content({
    key,
    file_content: await window
      .showOpenFilePicker()
      .then(([file_handle]) => file_handle.getFile())
      .then(file => file.text()),
  });
};

onMounted(() => {
  Object.values(Files).map(import_storage).forEach(handle_file_content);
});
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
