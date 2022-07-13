<template lang="pug">
nav
  q-button(@click="save" theme="secondary" type="icon" icon="q-icon-save")
  q-input(rootClass="search" v-model="item_search" suffix-icon="q-icon-search")
  q-button(type="icon" icon="q-icon-plus")
  q-button(type="icon" icon="q-icon-plus")
  q-input(rootClass="search" v-model="entity_search" suffix-icon="q-icon-search")
  q-popover(icon="q-icon-question" trigger="hover") Reset the files and return to main screen
    template(#reference)
      q-button(@click="clear_storage" theme="secondary" type="icon" icon="q-icon-close")
</template>

<script setup>
import { inject } from 'vue';

import Files from '../Files';

const items = inject(Files.ITEMS);
const entities = inject(Files.ENTITIES);
const item_search = inject(`${Files.ITEMS}:search`);
const entity_search = inject(`${Files.ENTITIES}:search`);

const save = () => {};

const clear_storage = () => {
  items.value = null;
  entities.value = null;
  localStorage.removeItem(Files.ITEMS);
  localStorage.removeItem(Files.ENTITIES);
};
</script>

<style lang="stylus" scoped>
nav
  display flex
  grid-area nav

  .search
    width 300px
    margin 0 1em

  .fit
    height max-content

  :nth-child(3)
    margin-right auto
</style>
