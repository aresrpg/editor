<template lang="pug">
.editor__container(:class="{ right }")
  .options
    .keys
      span Show names
      q-switch(v-model="fancy_name")
    .type
      q-cascader(
        multiple
        clearable
        v-model="select"
        placeholder="filters"
        collapse-tags
        :options="Options[key_name].filters.value"
      )
    .found
      span entries
      span {{ elements.length }}
  .content
    .list__container
      .element(v-for="element in elements" :key="element.id")
        .key {{ element.id }}
    slot
</template>

<script setup>
import { ref, inject, computed } from 'vue';

import Files from '../Files';

const { key_name, right } = defineProps(['key_name', 'right']);
const raw_elements = inject(key_name, {});
const search = inject(`${key_name}:search`, '');

const fancy_name = ref(false);
const select = ref();

const contains = (string = '') =>
  string.toLowerCase().includes(search.value.toLowerCase());

const extract = get_property =>
  Array.from(
    Object.values(raw_elements.value)
      .reduce((set, object) => set.add(get_property(object)), new Set())
      .values()
  ).sort();

const SPLIT_KEY = '%:$^%';
const Extractors = {
  [Files.ITEMS]: {
    type: ({ type }) => type,
    item: ({ item }) => item,
    name: ({ name }) => name,
    level: ({ level }) => level,
  },
  [Files.ENTITIES]: {
    type: ({ category }) => category,
    name: ({ display_name }) => display_name,
    xp: ({ xp }) => xp,
    level: ({ level: { min, max } }) => min + max / 2,
  },
};

const search_filter = ({ id, ...rest }) => {
  const name = Extractors[key_name].name(rest);
  if (search.value) return contains(name) || contains(id);
  return true;
};

const properties_filter = object => {
  if (!select.value) return true;
  return Array.from(
    Object.values(select.value)
      .map(value => value.split(SPLIT_KEY))
      .reduce((types, [type, rule]) => {
        if (!types.has(type)) types.set(type, new Set());
        types.get(type).add(rule);
        return types;
      }, new Map())
      .entries()
  )
    .map(([type, types]) => [type, Array.from(types.values())])
    .every(([type, types]) =>
      types.find(rule => {
        const property = Extractors[key_name][type](object);
        if (typeof property === 'number') {
          const [min, max] = rule.split(':');
          return property > +min && property <= +max;
        }
        return property === rule;
      })
    );
};

const make_key = (type, rule) => `${type}${SPLIT_KEY}${rule}`;

const Options = {
  [Files.ITEMS]: {
    existing_types: computed(() => extract(Extractors[Files.ITEMS].type)),
    existing_items: computed(() => extract(Extractors[Files.ITEMS].item)),
    insert_key: ([id, value], index) => {
      const final_id = fancy_name.value ? value.name : id;
      return { id: `${index}. ${final_id}`, ...value };
    },
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
        children: Options[key_name].existing_items.value.map(item => ({
          label: item,
          value: make_key('item', item),
        })),
      },
    ]),
  },
  [Files.ENTITIES]: {
    existing_types: computed(() => extract(({ category }) => category)),
    insert_key: ([id, value], index) => {
      const final_id = fancy_name.value ? value.display_name : id;
      return { id: `${index}. ${final_id}`, ...value };
    },
    filters: computed(() => [
      {
        label: 'Category',
        value: 'type',
        children: Options[key_name].existing_types.value.map(type => ({
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

const elements = computed(() => {
  const { insert_key } = Options[key_name];
  return Object.entries(raw_elements.value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(insert_key)
    .filter(search_filter)
    .filter(properties_filter);
});
</script>

<style lang="stylus" scoped>
.editor__container
  display flex
  flex-flow column nowrap
  &.right
     align-items flex-end

  .options
    display flex
    flex-flow row nowrap
    height 60px
    padding-left .5em
    >div
      display flex
      flex-flow column nowrap
      margin-right 1em
      span
        padding-bottom .25em
        font-size .7em
        text-transform uppercase
    .type
      min-width 200px
      justify-content center

    .found
      justify-content center
      :nth-child(2)
        font-size 1.5em
        font-weight 600


  .content
    display flex
    flex-flow row nowrap
    .list__container
      display flex
      flex-flow column nowrap
      height calc(100vh - 50px - 1em - 60px)
      padding 1em
      padding-top 0
      width max-content
      overflow hidden
      overflow-y auto

      .add
        position relative
      .element
        width 100%
        padding .5em 1em
        margin-top .5em
        border-radius 5px
        background #f0f0f3
        cursor pointer
        box-shadow 6px 6px 12px #dadadd, -6px -6px 12px #ffffff
</style>
