<template lang="pug">
.item__container
  //- name
  field(v-model="writable.name")
    template(#default="{ click }")
      .title(@click="click") {{ readable.name }}

  //- level
  field(v-if="readable.level" :numeric="true" v-model="writable.level")
    template(#default="{ click }")
      .level(@click="click") {{ readable.level }}

  //- minecraft item
  options(:options="minecraft_items" v-model="writable.item")
    template(#default="{ click }")
      .item(@click="click") {{ readable.item }}

  //- item category
  options(:options="types" v-model="writable.type")
    template(#default="{ click }")
      .type(@click="click") {{ readable.type }}

  //- enchanted
  .enchanted
    span Enchanted
    q-switch(v-model="writable.enchanted")

  //- critics
  .critics(v-if="readable.critics")
    span Critics
    field(numeric v-model="writable.critics[0]")
    span /
    field(numeric v-model="writable.critics[1]")
  //- item stats

  //- item description
  pre(v-highlightjs v-if="show_json")
    code.json {{ readable }}
</template>

<script setup>
import { computed, inject, ref, reactive, watch, watchEffect } from 'vue';

import minecraft_items from '../../minecraft_items';
import Files from '../Files';

import field from './editable-field.vue';
import options from './editable-select.vue';

const props = defineProps(['selected_id']);
const datas = inject(Files.ITEMS);
const show_json = inject(`${Files.ITEMS}:json`);

const writable = ref(datas[props.selected_id] ?? {});
const readable = computed(() => datas[props.selected_id] ?? {});

const types = ['equipment', 'misc', 'money', 'consumable', 'weapon'];

const normalize_item = ({
  name: unsafe_name,
  level: unsafe_level,
  type,
  item: unsafe_item,
  enchanted: unsafe_enchanted,
  critics: unsafe_critics,
  damage: unsafe_damage,
  stats: {
    vitality = 0,
    wisdom = 0,
    strength = 0,
    intelligence = 0,
    chance = 0,
    agility = 0,
  } = {},
  description = '',
}) => {
  const name = unsafe_name?.trim() ?? 'name missing';
  const level = unsafe_level || 1;
  const item = minecraft_items.includes(unsafe_item) ? unsafe_item : 'stone';
  const enchanted = !!unsafe_enchanted;
  const stats = {
    vitality,
    wisdom,
    strength,
    intelligence,
    chance,
    agility,
  };

  const critics = Array.isArray(unsafe_critics)
    ? unsafe_critics.slice(0, 2).map(x => Math.abs(x))
    : [1, 50];
  const damage = Array.isArray(unsafe_damage)
    ? unsafe_damage.slice(0, 2).map(x => Math.abs(x))
    : [1, 1];

  switch (type) {
    case 'equipment':
      return {
        name,
        level,
        type,
        item,
        enchanted,
        stats,
        description,
      };
    case 'misc':
      return {
        name,
        type,
        item,
        enchanted,
        description,
      };
    case 'money':
      return {
        name: 'kAres',
        type,
        item: 'gold_ingot',
        description:
          'En regardant de plus pres on peut meme y voir la tete de sceat, sa valeure est inestimable',
      };
    case 'consumable':
      return {
        name,
        level,
        type,
        item,
        enchanted,
        description,
      };
    case 'weapon':
      return {
        name,
        level,
        type,
        item,
        enchanted,
        stats,
        critics,
        damage,
        description,
      };
  }
};

watch(
  writable,
  value => {
    console.log('flush');
    datas[props.selected_id] = normalize_item(value);
  },
  { deep: true }
);

watch(props, ({ selected_id }) => {
  writable.value = datas[selected_id] ?? {};
});
// onMounted(flush);
// watchEffect(flush);
</script>

<style lang="stylus" scoped>

.item__container
  display flex
  padding 2em 1em
  flex-flow column nowrap
  width 100%
  pre
    margin-top 3em
    white-space pre-wrap
    border-radius 5px
    overflow hidden
    box-shadow 10px 10px 10px #bebebe, -10px -10px 10px #ffffff
  .title
    position relative
    font-size 1.6em
    height max-content
    padding-left .5em

    &::before
      content ''
      position absolute
      top 0
      left @top
      width 5px
      bottom 0
      border-radius 3px
      background var(--color-primary)
</style>
