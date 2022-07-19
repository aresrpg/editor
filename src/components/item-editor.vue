<template lang="pug">
.item__container
  //- name
  .name.full
    field(v-model="readable.name")
      template(#default="{ click }")
        .title(:class="{ enchant: readable.enchanted }" @click="click") {{ readable.name }}

    //- level
    .level(v-if="readable.level")
      span Lvl.
      field(v-if="writable.level" :numeric="true" v-model="writable.level")

  //- item category
  .type
    span Type:
    options(:options="types" v-model="writable.type")
      template(#default="{ click }")
        .inner(@click="click") {{ readable.type }}

  //- minecraft item
  .item
    span Item:
    options(:options="minecraft_items" v-model="writable.item")
      template(#default="{ click }")
        .inner(@click="click") {{ readable.item }}

  //- enchanted
  .enchanted
    span Enchanted:
    q-switch(v-model="writable.enchanted")

  //- critical
  .critical(v-if="readable.critical")
    span Critical:
    .multiple
      field(:numeric="true" v-model="writable.critical[0]")
        template(#default="{ click }")
          .inner(@click="click") {{ readable.critical[0] }}
      .sep /
      field(:numeric="true" v-model="writable.critical[1]")
        template(#default="{ click }")
          .inner(@click="click") {{ readable.critical[1] }}

  //- damage
  .damage(v-if="readable.damage")
    span Damage:
    .multiple
      field(:numeric="true" v-model="writable.critical[0]")
        template(#default="{ click }")
          .inner(@click="click") {{ readable.critical[0] }}
      .sep to
      field(:numeric="true" v-model="writable.critical[1]")
        template(#default="{ click }")
          .inner(@click="click") {{ readable.critical[1] }}

  //- item stats
  .stats.full(v-if="readable.stats")
    span Stats:
    .stat(v-for="stat in statistics" :key="stat")
      .name(:class="stat") {{ stat }}:
      field(:numeric="true" :allowNegative="true" v-model="writable.stats[stat]")
        template(#default="{ click }")
          .value(@click="click") {{ readable.stats[stat] }}

  //- item description
  .desc.full
    span Description:
    text-field(v-model="writable.description")
      template(#default="{ click }")
        .value(@click="click") {{ readable.description || 'no description' }}

  pre(v-highlightjs v-if="show_json")
    code.json {{ readable }}
</template>

<script setup>
import { computed, inject, watch, reactive, onMounted } from 'vue';

import minecraft_items from '../core/minecraft_items.js';
import Files from '../core/Files.js';
import normalize_item from '../core/normalize_item.js';

import field from './editable-field.vue';
import options from './editable-select.vue';
import textField from './editable-text.vue';

const types = ['equipment', 'misc', 'money', 'consumable', 'weapon'];
const statistics = [
  'vitality',
  'mind',
  'strength',
  'intelligence',
  'chance',
  'agility',
];

const props = defineProps(['id']);
const emits = defineEmits(['update']);
const items = inject(Files.ITEMS);

const writable = reactive({
  name: 'name missing',
  level: 1,
  type: 'misc',
  item: 'stone',
  enchanted: true,
  critical: [1, 50],
  damage: [1, 1],
  stats: {
    vitality: 0,
    mind: 0,
    strength: 0,
    intelligence: 0,
    chance: 0,
    agility: 0,
  },
  description: '',
});
const readable = computed(() => normalize_item(writable));

onMounted(() => Object.assign(writable, items[props.id]));

watch(props, ({ id }) => Object.assign(writable, items[id]), { deep: true });
watch(writable, value => emits('update', normalize_item(value)));

const show_json = inject(`${Files.ITEMS}:json`);
</script>

<style lang="stylus" scoped>
.item__container
  display flex
  padding 2em 1em
  flex-flow column nowrap
  width 100%
  height max-content
  overflow hidden
  overflow-y auto
  height calc(100vh - 50px - 1em)
  >div
    display flex
    padding-left 2em
    margin-bottom .25em
    flex-flow column nowrap
    padding-top .5em
    width 200px
    >span
      width 100px
      text-transform uppercase
      font-size .7em
      font-weight 900

  .full
    width 100%

  .stats
    flex-flow column nowrap
    .stat
      margin-left 1em
      display flex
      .name
        text-transform uppercase
        font-size .7em
        width 100px
        font-weight 900
        &.vitality
          color #C0392B
        &.mind
          color #8E44AD
        &.strength
          color #6D4C41
        &.intelligence
          color #F39C12
        &.chance
          color #2980B9
        &.agility
          color #27AE60


  .name
    display flex
    flex-flow row nowrap
    margin-bottom 1em
    padding-left 0
    .title
      position relative
      font-size 1.6em
      height max-content
      padding-left .5em
      justify-content stretch

      &.enchant
        animation enchanted 2s linear infinite reverse

      &::before
        content ''
        position absolute
        top 0
        left @top
        width 5px
        bottom 0
        border-radius 3px
        background var(--color-primary)
    .level
      font-size 1.2em
      margin-left 1em
      display flex
      flex-flow row nowrap
      text-decoration underline
      justify-content center
      align-items baseline
      color #27AE60
      font-weight 600

  pre
    margin-top 3em
    white-space pre-wrap
    code
      border-radius 10px
      box-shadow 10px 10px 10px #bebebe, -10px -10px 10px #ffffff

.multiple
  display flex
  flex-flow row nowrap
  .sep
    padding 0 .5em

@keyframes enchanted
  0%
    color #0050EF
  25%
    color #6A00FF
  50%
    color #AA00FF
  75%
    color #F472D0
  100%
    color #D80073
</style>
