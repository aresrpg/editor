<template lang="pug">
.editor__container
  .content
    .list__container
      .element(
          :class="{ selected: selected_element === element._id }"
          @click="() => select_element(element._id)"
          v-for="element in elements"
          :key="element._id"
        )
        .key {{ element.id }}
    slot.slot(v-if="selected_element" :selected="selected_element")
</template>

<script setup>
import { inject, computed } from 'vue';

import Editors from '../core/Editors';
import Folders from '../core/Folders';
import stored_ref from '../core/stored_ref';

const props = defineProps(['editor']);

const Injected = {
  [Editors.ITEMS]: {
    search: inject(`${Editors.ITEMS}:search`, ''),
    fancy_name: inject(`${Editors.ITEMS}:fancy_name`),
    select: inject(`${Editors.ITEMS}:select`),
    raw_elements: inject(Folders.ARESRPG).data['items.json'],
  },
  [Editors.ENTITIES]: {
    search: inject(`${Editors.ENTITIES}:search`, ''),
    fancy_name: inject(`${Editors.ENTITIES}:fancy_name`),
    select: inject(`${Editors.ENTITIES}:select`),
    raw_elements: inject(Folders.ARESRPG).data['entities.json'],
  },
};

const search = computed({
  get: () => Injected[props.editor].search.value,
  set: value => {
    Injected[props.editor].search.value = value;
  },
});
const fancy_name = computed({
  get: () => Injected[props.editor].fancy_name.value,
  set: value => {
    Injected[props.editor].fancy_name.value = value;
  },
});
const select = computed({
  get: () => Injected[props.editor].select.value,
  set: value => {
    Injected[props.editor].select.value = value;
  },
});
const raw_elements = computed({
  get: () => Injected[props.editor].raw_elements,
  set: value => {
    Object.assign(Injected[props.editor].raw_elements, value);
  },
});

const found_entries_count = inject('entries_count', 0);

const selected_element = stored_ref(`${props.editor}:selected`);
const select_element = id => {
  if (selected_element.value === id) selected_element.value = null;
  else selected_element.value = id;
};

const contains = (string = '') =>
  string.toLowerCase().includes(search.value.toLowerCase());

const Extractors = {
  [Editors.ITEMS]: {
    type: ({ type }) => type,
    item: ({ item }) => item,
    name: ({ name }) => name,
    level: ({ level }) => level,
    enchanted: ({ enchanted }) => enchanted,
    description: ({ description }) => description,
  },
  [Editors.ENTITIES]: {
    type: ({ category }) => category,
    name: ({ display_name }) => display_name,
    xp: ({ xp }) => xp,
    level: ({ level: { min, max } }) => min + max / 2,
  },
};

const search_filter = ({ id, ...rest }) => {
  const name = Extractors[props.editor].name(rest);
  if (search.value) return contains(name) || contains(id);
  return true;
};

const properties_filter = object => {
  if (!select.value) return true;
  return Array.from(
    Object.values(select.value)
      .map(value => JSON.parse(value))
      .reduce((types, { type, rule }) => {
        if (!types.has(type)) types.set(type, new Set());
        types.get(type).add(rule);
        return types;
      }, new Map())
      .entries()
  )
    .map(([type, types]) => [type, Array.from(types.values())])
    .every(([type, types]) =>
      types.find(rule => {
        const property = Extractors[props.editor][type](object);
        switch (type) {
          case 'level': {
            const [min, max] = rule.split(':');
            return property > +min && property <= +max;
          }
          case 'enchanted':
            return !!property;
          case 'description':
            if (rule === 'no_desc') return !property;
            return property && property.trim();
          default:
            return property === rule;
        }
      })
    );
};

const Options = {
  [Editors.ITEMS]: {
    insert_key: ([id, value]) => {
      const final_id = fancy_name.value ? value.name : id;
      return { id: final_id, _id: id, ...value };
    },
  },
  [Editors.ENTITIES]: {
    insert_key: ([id, value], index) => {
      const final_id = fancy_name.value ? value.display_name : id;
      return { id: final_id, ...value };
    },
  },
};

const elements = computed(() => {
  const { insert_key } = Options[props.editor];
  const result = Object.entries(raw_elements.value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(insert_key)
    .filter(search_filter)
    .filter(properties_filter);
  found_entries_count.value = result.length;
  return result;
});
</script>

<style lang="stylus" scoped>
.editor__container
  display flex
  flex-flow column nowrap
  .content
    display flex
    flex-flow row nowrap
    .list__container
      display flex
      flex-flow column nowrap
      height calc(100vh - 50px - 1em)
      padding 1em
      padding-top 0
      min-width max-content
      overflow hidden
      overflow-y auto
      .add
        position relative
      .element
        user-select none
        width 100%
        padding .5em 1em
        margin-top .5em
        border-radius 5px
        background #f0f0f3
        cursor pointer
        box-shadow 6px 6px 12px #dadadd, -6px -6px 12px #ffffff
        transition all 200ms ease-in-out
        &.selected
          position relative
          background var(--gradient-primary)
          color white
          transform translateX(-10px)
</style>
