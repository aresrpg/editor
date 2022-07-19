<template lang="pug">
nav
  q-input.search(rootClass="search" v-model="search" suffix-icon="q-icon-search")
  q-button.add(type="icon" icon="q-icon-plus")
  .option.entries
    span entries
    tween(:number="found_entries_count")
  .option.name
    span names
    q-switch(v-model="fancy_name")
  .option.json
    span json
    q-switch(v-model="show_json")
  q-cascader.filter(
    multiple
    clearable
    v-model="select"
    placeholder="filters"
    collapse-tags
    :options="Options[props.key_name].filters.value"
  )
  q-tabs.tabs(v-model="active_tab")
    q-tab-pane(:name="Files.ITEMS" title="Items")
    q-tab-pane(:name="Files.ENTITIES" title="Entities")
    q-tab-pane(:name="Files.TEXTURES" title="Vanilla" disabled)
  q-button.save(@click="save" theme="secondary" type="icon" icon="q-icon-save")
  q-button.clear(@click="on_reset" theme="secondary" type="icon" icon="q-icon-close")
</template>

<script setup>
import { useMessageBox } from '@qvant/qui-max';
import { inject, computed, watchEffect } from 'vue';

import Files from '../core/Files';

import tween from './tween.vue';


const message_box = useMessageBox();

const props = defineProps(['key_name']);

const raw_elements = inject(props.key_name, {})
const active_tab = inject('selected_editor')

const items = inject(Files.ITEMS);
const entities = inject(Files.ENTITIES);

const Injected = {
  [Files.ITEMS]: {
    search: inject(`${Files.ITEMS}:search`, ''),
    show_json: inject(`${Files.ITEMS}:json`),
    fancy_name: inject(`${Files.ITEMS}:fancy_name`),
    select: inject(`${Files.ITEMS}:select`),
  },
  [Files.ENTITIES]: {
    search: inject(`${Files.ENTITIES}:search`, ''),
    show_json: inject(`${Files.ENTITIES}:json`),
    fancy_name: inject(`${Files.ENTITIES}:fancy_name`),
    select: inject(`${Files.ENTITIES}:select`),
  }
}

const search = computed({
  get: () => Injected[props.key_name].search.value,
  set: value => {Injected[props.key_name].search.value = value}
})
const show_json = computed({
  get: () => Injected[props.key_name].show_json.value,
  set: value => {Injected[props.key_name].show_json.value = value}
})
const fancy_name = computed({
  get: () => Injected[props.key_name].fancy_name.value,
  set: value => {Injected[props.key_name].fancy_name.value = value}
})
const select = computed({
  get: () => Injected[props.key_name].select.value,
  set: value => {Injected[props.key_name].select.value = value}
})

const found_entries_count = inject('entries_count', 0)

const save = () => {};

const on_reset = async () => {
  try {
    await message_box({
      title: 'Are you sure ?',
      submessage: 'Make sure you saved your work before leaving',
      confirmButtonText: 'Clear files',
      cancelButtonText: 'cancel',
    });

    Object.keys(items).forEach(key => delete items[key]);
    Object.keys(entities).forEach(key => delete entities[key]);
    localStorage.removeItem(Files.ITEMS);
    localStorage.removeItem(Files.ENTITIES);
  } catch (error) {
    console.error(error);
  }
};

const make_key = (type, rule = type) => JSON.stringify({ type, rule });

const extract = get_property =>
  Array.from(
    Object.values(raw_elements)
      .reduce((set, object) => set.add(get_property(object)), new Set())
      .values()
  ).sort();

const Options = {
  [Files.ITEMS]: {
    existing_types: computed(() => extract(({ type }) => type)),
    existing_items: computed(() => extract(({ item }) => item)),
    filters: computed(() => [
      {
        label: 'Type',
        value: 'type',
        children: Options[Files.ITEMS].existing_types.value.map(type => ({
          label: type,
          value: make_key('type', type),
        })),
      },
      {
        label: 'Level',
        value: 'level',
        children: [
          { label: '1 to 25', value: make_key('level', '0:25') },
          { label: '25 to 50', value: make_key('level', '25:50') },
          { label: '50 to 75', value: make_key('level', '50:75') },
          { label: 'above 75', value: make_key('level', '75:200') },
        ],
      },
      {
        label: 'Item',
        value: 'item',
        children: Options[Files.ITEMS].existing_items.value.map(item => ({
          label: item,
          value: make_key('item', item),
        })),
      },
      {
        label: 'Enchanted',
        value: make_key('enchanted'),
      },
      {
        label: 'Description',
        value: 'desc',
        children: [
          { label: 'With description', value: make_key('description') },
          {
            label: 'Without description',
            value: make_key('description', 'no_desc'),
          },
        ],
      },
    ]),
  },
  [Files.ENTITIES]: {
    existing_types: computed(() => extract(({ category }) => category)),
    filters: computed(() => [
      {
        label: 'Category',
        value: 'type',
        children: Options[Files.ENTITIES].existing_types.value.map(type => ({
          label: type,
          value: make_key('type', type),
        })),
      },
      {
        label: 'Level',
        value: 'level',
        children: [
          { label: '1 to 25', value: make_key('level', '0:25') },
          { label: '25 to 50', value: make_key('level', '25:50') },
          { label: '50 to 75', value: make_key('level', '50:75') },
          { label: 'above 75', value: make_key('level', '75:4000') },
        ],
      },
      {
        label: 'Xp Given',
        value: 'xp',
        children: [
          { label: '1 to 10', value: make_key('xp', '0:10') },
          { label: '10 to 40', value: make_key('xp', '10:40') },
          { label: '40 to 100', value: make_key('xp', '40:100') },
          { label: '100 to 300', value: make_key('xp', '100:300') },
          { label: '300 to 700', value: make_key('xp', '300:700') },
          { label: '700 to 1500', value: make_key('xp', '700:1500') },
          { label: '1500 to 5000', value: make_key('xp', '1500:5000') },
          { label: '5000 to 10000', value: make_key('xp', '5000:10000') },
          { label: 'above 10000', value: make_key('xp', '10000:999999') },
        ],
      },
    ]),
  },
};
</script>

<style lang="stylus" scoped>
nav
  display grid
  grid 'search add entries name json filter tabs save clear' 1fr / 300px 50px 60px 70px 70px 250px 1fr 50px 50px
  width: 100%
  grid-area nav
  place-items center center
  .option
    display flex
    flex-flow column nowrap
    span
      padding-bottom .25em
      font-size .7em
      text-transform uppercase
    &.entries
      :nth-child(2)
        font-size 1.5em
        font-weight 600
        height max-content

  .q-button+.q-button
    margin 0

.search
  grid-area search
.add
  grid-area add
.name
  grid-area name
.json
  grid-area json
.filter
  grid-area filter
.entries
  grid-area entries
.tabs
  grid-area tabs
.save
  grid-area save
.clear
  grid-area clear
</style>
