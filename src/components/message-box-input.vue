<script setup>
import { computed, inject, onMounted, ref } from 'vue';
import { QMessageBoxContent } from '@qvant/qui-max';

import Folders from '../core/Folders';

const message = inject('qMessageBoxContainer');
const id = ref('');
const items = inject(Folders.ARESRPG)['items.json'];
const name_list = computed(() =>
  Object.keys(items)
    .filter(name => name.startsWith(id.value))
    .sort()
    .slice(0, 5)
);
const on_confirm = () => {
  message.emitDoneEvent({
    action: 'confirm',
    payload: id.value,
  });
};
const on_cancel = () => {
  message.emitDoneEvent({
    action: 'cancel',
  });
};
</script>

<template lang="pug">
q-message-box-content
  template(#title) Enter the new id
  template(#content)
    q-input(v-model="id" @keyup.enter="on_confirm")
    span Similar items :
    .names
      .name(v-for="name in name_list" :key="name") {{ name }}
  template(#actions)
    q-button(@click='on_confirm' :disabled="!id.length || id in items") Create
    q-button(theme='secondary' @click='on_cancel') Cancel
</template>

<style lang="stylus" scoped>
span
  font-weight 800
  font-size .7em
  text-transform uppercase
  margin-top .5em
.names
  display flex
  flex-flow column nowrap
  font-size .7em
  opacity .8
  .name
    // padding .25em 0
</style>
