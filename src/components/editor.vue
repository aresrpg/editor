<template lang="pug">
.editor__container
  .content
    .list__container(@drop="on_drop($event, undefined)" @dragenter.prevent @dragover.prevent)
      transition-group(name="fade")
        .element(
            :class="{ selected: selected_element === element._id, sub: !!element.items, moved: selected_set_id === element._id || selected_element === element._id }"
            @click.stop="() => select_element(element._id)"
            v-for="element in elements"
            :key="element._id"
            :draggable="!element.items"
            @dragstart="on_drag($event, element)"
            @drop="on_drop($event, element)"
            @dragenter.prevent @dragover.prevent
          )
          .key {{ element.id }}
          q-button.del(
            theme="link"
            type="icon"
            :style="{ fontSize: element.items ? '1.3em' : '24px' }"
            :icon="element.items ? 'q-icon-trash-bin-stroke' : 'q-icon-close'"
            @click.stop="() => on_delete_element(element, !!element.items)"
          )
          .sub_elements(v-if="element.items")
            transition-group(name="fade")
              .sub_element(
                v-for="sub_element in element.items"
                :class="{ selected: selected_element === sub_element._id }"
                @click.stop="() => select_element(sub_element._id)"
                :key="sub_element._id"
                draggable="true"
                @dragstart="on_drag($event, sub_element)"
                )
                .key {{ sub_element.id }}
                q-button.del(
                  theme="link"
                  type="icon"
                  icon="q-icon-close"
                  @click.stop="() => on_delete_element(sub_element)"
                )
    slot.slot(:set_ref="set_ref" v-if="selected_element" :selected="selected_element")
</template>

<script setup>
import { inject, computed, ref } from 'vue'
import { useMessageBox } from '@qvant/qui-max'

import Editors from '../core/Editors'
import Folders from '../core/Folders'
import stored_ref from '../core/stored_ref'
import { normalize_set } from '../core/items'

const props = defineProps(['editor'])
const emits = defineEmits(['deletion', 'update_set'])
const message_box = useMessageBox()
// used to call functions on the component
const current_editor_instance = ref()
const set_ref = slot_ref => (current_editor_instance.value = slot_ref)
const DATA = inject(Folders.ARESRPG)

const Injected = {
  [Editors.ITEMS]: {
    search: inject(`${Editors.ITEMS}:search`, ''),
    fancy_name: inject(`${Editors.ITEMS}:fancy_name`),
    select: inject(`${Editors.ITEMS}:select`),
    raw_elements: DATA['items.json'],
    sets: DATA['sets.json'],
  },
  [Editors.ENTITIES]: {
    search: inject(`${Editors.ENTITIES}:search`, ''),
    fancy_name: inject(`${Editors.ENTITIES}:fancy_name`),
    select: inject(`${Editors.ENTITIES}:select`),
    raw_elements: inject(Folders.ARESRPG)['entities.json'],
  },
}

const search = computed({
  get: () => Injected[props.editor].search.value,
  set: value => {
    Injected[props.editor].search.value = value
  },
})
const fancy_name = computed({
  get: () => Injected[props.editor].fancy_name.value,
  set: value => {
    Injected[props.editor].fancy_name.value = value
  },
})
const select = computed({
  get: () => Injected[props.editor].select.value,
  set: value => {
    Injected[props.editor].select.value = value
  },
})

const raw_elements = computed({
  get: () => Injected[props.editor].raw_elements,
  set: value => {
    Object.assign(Injected[props.editor].raw_elements, value)
  },
})

const raw_sets = computed({
  get: () => Injected[props.editor].sets,
  set: value => {
    Object.assign(Injected[props.editor].sets, value)
  },
})

function set_id_of_item(id) {
  const [key] =
    Object.entries(raw_sets.value).find(([, value]) =>
      value.items.includes(id)
    ) ?? []
  return key
}

const found_entries_count = inject('entries_count', 0)
const selected_element = stored_ref(`${props.editor}:selected`)
const selected_set_id = computed(() => set_id_of_item(selected_element.value))
const select_element = async id => {
  if (current_editor_instance.value?.is_uploading()) {
    await message_box({
      title: `Not so fast!`,
      submessage: 'You are currently uploading a texture',
      cancelButtonText: 'cancel',
    }).catch(() => {})
  } else if (selected_element.value === id) selected_element.value = null
  else selected_element.value = id
}

const contains = (string = '') =>
  string.toLowerCase().includes(search.value.toLowerCase())

const Extractors = {
  [Editors.ITEMS]: {
    type: ({ type }) => type,
    item: ({ item }) => item,
    name: ({ name }) => name,
    level: ({ level }) => level,
    enchanted: ({ enchanted }) => enchanted,
    description: ({ description }) => description,
    get_set_name: id =>
      Object.entries(Injected[Editors.ITEMS].sets).find(([, value]) =>
        value.items.includes(id)
      )?.[0],
  },
  [Editors.ENTITIES]: {
    type: ({ category }) => category,
    name: ({ display_name }) => display_name,
    xp: ({ xp }) => xp,
    level: ({ level: { min, max } }) => min + max / 2,
  },
}

const search_filter = ({ _id, items, ...rest }) => {
  const extractor = Extractors[props.editor]
  const name = extractor.name(rest)
  const name_of_set = extractor.get_set_name(_id)
  if (search.value) {
    const name_contained =
      contains(name) || contains(_id) || (name_of_set && contains(name_of_set))
    if (items) return name_contained || items.filter(search_filter).length
    return name_contained
  }
  return true
}

const properties_filter = object => {
  if (!select.value) return true
  return Array.from(
    Object.values(select.value)
      .map(value => JSON.parse(value))
      .reduce((types, { type, rule }) => {
        if (!types.has(type)) types.set(type, new Set())
        types.get(type).add(rule)
        return types
      }, new Map())
      .entries()
  )
    .map(([type, types]) => [type, Array.from(types.values())])
    .every(([type, types]) =>
      types.find(rule => {
        const property = Extractors[props.editor][type](object)
        switch (type) {
          case 'level': {
            const [min, max] = rule.split(':')
            return property > +min && property <= +max
          }
          case 'enchanted':
            return !!property
          case 'description':
            if (rule === 'no_desc') return !property
            return property && property.trim()
          default:
            return property === rule
        }
      })
    )
}

const Options = {
  [Editors.ITEMS]: {
    insert_key: ([id, value]) => {
      const final_id = fancy_name.value ? value.name : id
      return { id: final_id, _id: id, ...value }
    },
  },
  [Editors.ENTITIES]: {
    insert_key: ([id, value], index) => {
      const final_id = fancy_name.value ? value.display_name : id
      return { id: final_id, ...value }
    },
  },
}

const elements = computed(() => {
  const { insert_key } = Options[props.editor]
  const apply_filters = array =>
    array
      .sort(([a], [b]) => a.localeCompare(b))
      .map(insert_key)
      .filter(search_filter)
      .filter(properties_filter)

  const raw_elements_entries = Object.entries(raw_elements.value)

  // here we merge the sets and the raw items
  const merge_sets = [
    ...Object.entries(raw_sets.value).map(([key, value]) => [
      key,
      {
        ...value,
        _id: key,
        items: apply_filters(
          raw_elements_entries.filter(([key]) => value.items.includes(key))
        ),
      },
    ]),
    ...raw_elements_entries.filter(
      ([key]) =>
        !Object.values(raw_sets.value)
          .flatMap(({ items }) => items)
          .includes(key)
    ),
  ]

  const result = apply_filters(merge_sets)
  found_entries_count.value = result.reduce(
    (length, { items = [] }) => length + 1 + items.length,
    0
  )
  return result
})

const on_delete_element = async ({ _id }, is_set) => {
  try {
    await message_box({
      title: `Delete ${_id}`,
      submessage: is_set ? 'This will not delete items' : '',
      confirmButtonText: 'delete',
      cancelButtonText: 'cancel',
    })
    emits('deletion', { id: _id, is_set })
    if (is_set) delete raw_sets.value[_id]
    else delete raw_elements.value[_id]
  } catch {}
}

const on_drag = (event, item) => {
  if (item.items) {
    return
  }
  event.dataTransfer.dropEffect = 'move'
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('id', item._id)
}

const on_drop = (event, dropped_set) => {
  // only allow the dropped_set to be either null, or an actual set
  // (discard event calls on a normal item)
  if (dropped_set && !dropped_set.items) return

  // event is handled, don't let it bubble up
  event.stopPropagation()

  const { _id: set_id } = dropped_set ?? {}
  const id = event.dataTransfer.getData('id')
  const old_set_id = set_id_of_item(id)
  if (old_set_id === set_id) return

  // remove from old set
  const old_set = raw_sets.value[old_set_id]
  if (old_set) {
    old_set.items = old_set.items.filter(item_id => item_id !== id)
    emits('update_set', { id: old_set_id, set: normalize_set(old_set) })
    current_editor_instance.value.reload_set(old_set_id)
  }

  // if new set is not null, then we add the item to it
  // otherwise it will not be in any set (and it's fine)
  const new_set = raw_sets.value[set_id]
  if (new_set) {
    new_set.items.push(id)
    emits('update_set', { id: set_id, set: normalize_set(new_set) })
    current_editor_instance.value.reload_set(set_id)
  }
}
</script>

<style lang="stylus" scoped>
.fade-enter-active, .fade-leave-active
  transition all 300ms

.fade-enter, .fade-leave-to
  opacity 0
  transform translateY(30px)
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
        display flex
        flex-flow row nowrap
        height 36px
        align-items center
        .key
          margin-right auto
        .del
          color #7F8C8D
          opacity .5
          &:hover
            color var(--color-primary)
            opacity 1
        &.moved
          transform translateX(-10px)
        &.selected
          position relative
          background var(--gradient-primary)
          color white
          .del
            color white
            opacity 1
            &:hover
              color black
              opacity 1
        &.sub
          flex-flow column nowrap
          position relative
          height max-content
          padding 0
          border 2px solid #3498DB

          >.del
            position absolute
            top -.2em
            right 0
            color crimson
          >.key
            padding .5em 1em
            font-weight 900
            text-transform uppercase
            font-size .8em
          .sub_elements
            background #f0f0f3
            display flex
            flex-flow column nowrap
            width 100%
            .sub_element
              pointer-events auto
              cursor pointer
              padding-left 1.5em
              height 25px
              display flex
              flex-flow row nowrap
              color rgba(#1A1509, .64)
              align-items center

              .del
                color #7F8C8D
                opacity .5
                &:hover
                  color var(--color-primary)
                  opacity 1
              &.selected
                background var(--gradient-primary)
                color white
                .del
                  color white
                  opacity 1
                  &:hover
                    color black
                    opacity 1
</style>
