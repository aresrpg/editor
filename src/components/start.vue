<template lang="pug">
.start__container
  span Welcome in AresRpg's data editor
  span Please locate the #[b(:class="{ valid: present(items) && present(entities) }" @click="on_pick_ares") aresrpg/aresrpg] and #[b(:class="{ valid: present({}) }" @click="() => on_pick(Files.ENTITIES)") aresrpg/resourcepacks] folders to start
</template>

<script setup>
import { inject } from 'vue';

import Files from '../core/Files.js';
import read_aresrpg from '../core/read_aresrpg.js';

const items = inject(Files.ITEMS);
const entities = inject(Files.ENTITIES);

const present = obj => !!Object.keys(obj).length;

const on_pick_ares = async () => {
  try {
    const { items: items_content, entities: entities_content } = await window
      .showDirectoryPicker()
      .then(read_aresrpg);

    Object.assign(items, items_content);
    Object.assign(entities, entities_content);
  } catch {
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
