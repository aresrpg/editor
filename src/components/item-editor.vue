<template lang="pug">
.item__container
  .item__set(v-if="set_of_item")
    .set_name
      field(v-model="writable_set.name")
        template(#default="{ click }")
          .title(@click="click") {{ readable_set.name }}
    span Stats when multiples items are equipped
    .set_bonus
      .bonus(v-for="(current_stats, index) in readable_set.stats" :key="index" v-if="index !== 0")
        span {{ index +1 }} items
        .stat(v-for="stat in statistics" :key="stat" v-if="current_stats")
          .name(:class="stat") {{ stat }}:
          field(:numeric="true" :allowNegative="true" v-model="writable_set.stats[index][stat]")
            template(#default="{ click }")
              .value(@click="click") {{ current_stats[stat] ?? 0 }}
  //- name
  .item__middle
    .left
      .name.full
        field(v-model="writable.name")
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

      //- enchanted
      .enchanted
        span Enchanted:
        q-switch(v-model="writable.enchanted")

      //- critical
      .critical(v-if="readable.critical")
        span Critical:
        .multiple
          field(:numeric="true" v-model="writable.critical.from")
            template(#default="{ click }")
              .inner(@click="click") {{ readable.critical.from }}
          .sep /
          field(:numeric="true" v-model="writable.critical.to")
            template(#default="{ click }")
              .inner(@click="click") {{ readable.critical.to }}
          .bonus
            .par (+
            field(:numeric="true" v-model="writable.critical.bonus")
              template(#default="{ click }")
                .inner(@click="click") {{ readable.critical.bonus }}
            .par )


      //- damage
      .damage(v-if="readable.damage")
        span Damage:
        .damage_row(v-for="(row, index) in readable.damage" :key="index" :class="{ [readable.damage[index].element]: true }")
          field(:numeric="true" v-model="writable.damage[index].from" :element="readable.damage[index].element")
            template(#default="{ click }")
              .inner(@click="click") {{ readable.damage[index].from }}
          .sep to
          field(:numeric="true" v-model="writable.damage[index].to" :element="readable.damage[index].element")
            template(#default="{ click }")
              .inner.right(@click="click") {{ readable.damage[index].to }}
          options.options(:options="elements" v-model="writable.damage[index].element")
            template(#default="{ click }")
              .inner(@click="click") {{ readable.damage[index].element }}
          options.options(:options="damage_types" v-model="writable.damage[index].type")
            template(#default="{ click }")
              .inner(@click="click") {{ readable.damage[index].type }}
          q-button.del(
              theme="link"
              type="icon"
              icon="q-icon-close"
              @click="() => del_damage(index)"
            )
        .new_damage_row(@click="add_damage") Add damage

      //- item stats
      .stats.full(v-if="readable.stats")
        span Stats:
        .stat(v-for="stat in statistics" :key="stat")
          .name(:class="stat") {{ stat }}:
          field(:numeric="true" :allowNegative="true" v-model="writable.stats[stat][0]")
            template(#default="{ click }")
              .value(@click="click") {{ readable.stats[stat][0] ?? 0 }}
          .to >
          field(:numeric="true" :allowNegative="true" v-model="writable.stats[stat][1]")
            template(#default="{ click }")
              .value(@click="click") {{ readable.stats[stat][1] ?? 0 }}
      //- item description
      .desc.full
        span Description:
        text-field(v-model="writable.description")
          template(#default="{ click }")
            .value(@click="click") {{ readable.description || 'no description' }}

    .right(v-if="show_texture_upload")
      q-upload.upload(
        :value="uploaded_files"
        :accept="['.json', '.png', '.mcmeta']"
        :multiple="true"
        :limit="3"
        text-upload-file="Upload item.json & item.png"
        @select="on_upload_model"
        @clear="on_clear_model"
        @clear-all="uploaded_files = []"
      )
      q-button.change(size="small" :theme="all_files_uploaded ? 'primary' : 'secondary'" @click="on_confirm_texture") {{ all_files_uploaded ? 'confirm' : 'cancel '}}
    .right(v-else)
      three.three(
        v-if="is_3D_model"
        :model_json="item_model"
        :model_texture_blob="item_texture"
        :model_mcmeta_json="item_mcmeta"
      )
      .img_container(v-else)
        img.texture(:src="create_url(item_texture ?? default_texture)")
      q-button.change(size="small" theme="primary" @click="show_texture_upload = true") {{ item_texture ? 'replace texture' : 'set texture'}}
      q-button.remove(size="small" theme="secondary" @click="on_delete_texture" v-if="item_texture") delete texture

  pre(v-highlightjs v-if="show_json")
    code.json {{ readable }}
</template>

<script setup>
import { computed, inject, watch, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useMessageBox } from '@qvant/qui-max'

import Editors from '../core/Editors.js'
import {
  normalize_item,
  normalize_set,
  types,
  statistics,
  elements,
  damage_types,
  DEFAULT_ITEM,
  DEFAULT_SET,
} from '../core/items.js'
import Folders from '../core/Folders'
import { save_file } from '../core/directories.js'
import Textures from '../core/Textures.js'

import field from './editable-field.vue'
import options from './editable-select.vue'
import textField from './editable-text.vue'
import three from './three.vue'

const props = defineProps(['id', 'listen_deletion'])
const emits = defineEmits(['update', 'update_set'])
const DATA = inject(Folders.ARESRPG)
const items = DATA['items.json']
const sets = DATA['sets.json']
const message_box = useMessageBox()

const RESOURCES = inject(Folders.RESOURCES)
const ARESRPG_HANDLE = inject(`${Folders.ARESRPG}:handle`)
const RESOURCES_HANDLE = inject(`${Folders.RESOURCES}:handle`)

const show_texture_upload = ref(false)
const uploaded_files = ref([])

const toast = useToast()
const on_clear_model = file_id => {
  uploaded_files.value = uploaded_files.value.filter(({ id }) => id !== file_id)
}

const on_upload_model = async (sourceFile, file_id) => {
  uploaded_files.value.push({
    id: file_id,
    sourceFile,
    name: sourceFile.name,
  })
}

const set_of_item = computed(() => {
  const found_set = Object.entries(sets).find(([, value]) =>
    value.items.includes(props.id)
  )
  if (found_set) {
    const [_id, value] = found_set
    return {
      _id,
      ...value,
    }
  }
  return undefined
})

const file_extension = file_name => {
  const parts = file_name.split('.')
  if (parts.length > 1) return parts.pop()
}

const all_files_uploaded = computed(() => uploaded_files.value.length)

const create_url = blob => URL.createObjectURL(blob)

const on_delete_texture = () =>
  Textures({
    RESOURCES,
    RESOURCES_HANDLE: RESOURCES_HANDLE.value,
    item_id: props.id,
    item: readable.value.item,
  })
    .delete_texture()
    .then(() => {
      writable.custom_model_data = 0
    })

const item_model = computed(() => {
  const {
    assets: {
      minecraft: {
        models: { custom: { [`${props.id}.json`]: model } = {} },
      },
    },
  } = RESOURCES
  return model
})
const item_texture = computed(() => {
  const {
    assets: {
      minecraft: {
        textures: { custom: { [`${props.id}.png`]: texture } = {} },
      },
    },
  } = RESOURCES
  if (texture) return texture
})
const default_texture = computed(() => {
  const {
    assets: {
      minecraft: {
        textures: { item: { [`${items[props.id].item}.png`]: texture } = {} },
      },
    },
  } = RESOURCES
  if (texture) return texture
})
const item_mcmeta = computed(() => {
  const {
    assets: {
      minecraft: {
        textures: { custom: { [`${props.id}.mcmeta`]: mcmeta } = {} },
      },
    },
  } = RESOURCES
  return mcmeta
})

const is_3D_model = computed(() => {
  const model = item_model.value ?? {}
  return 'elements' in model
})

// item
const writable = reactive(DEFAULT_ITEM)
const readable = computed(() => normalize_item(writable))

watch(props, ({ id }) => Object.assign(writable, items[id]), {
  deep: true,
  immediate: true,
})
watch(writable, value => emits('update', normalize_item(value)))

// set
const writable_set = reactive(DEFAULT_SET)
const readable_set = computed(() => normalize_set(writable_set))

watch(
  set_of_item,
  ({ _id } = {}) => {
    if (_id) {
      Object.assign(writable_set, sets[_id])
    }
  },
  {
    deep: true,
    immediate: true,
  }
)
watch(writable_set, value => emits('update_set', normalize_set(value)))

const is_uploading = () => !!show_texture_upload.value

defineExpose({ is_uploading })

const add_damage = () => writable.damage.push({})
const del_damage = index => writable.damage.splice(index, 1)

const on_confirm_texture = async () => {
  if (all_files_uploaded.value) {
    const find_file = type =>
      uploaded_files.value.find(({ name }) => file_extension(name) === type)
        ?.sourceFile
    const model = find_file('json')
    const custom_texture = find_file('png')
    const mcmeta = find_file('mcmeta')

    const { set_texture, delete_texture } = Textures({
      RESOURCES,
      RESOURCES_HANDLE: RESOURCES_HANDLE.value,
      item_id: props.id,
      item: readable.value.item,
    })

    const custom_model_json = model ? JSON.parse(await model.text()) : undefined
    const custom_mcmeta = mcmeta ? JSON.parse(await mcmeta.text()) : undefined

    if (custom_texture) {
      await delete_texture()
      const custom_model_data = await set_texture({
        custom_texture,
        custom_model_json,
        custom_mcmeta,
      })
      writable.custom_model_data = custom_model_data
    } else
      toast('You must at least upload a png texture', {
        type: 'error',
      })
  }
  uploaded_files.value = []
  show_texture_upload.value = false
}

const show_json = inject(`${Editors.ITEMS}:json`)
</script>

<style lang="stylus" scoped>
.vitality
  color #C0392B
.mind
  color #8E44AD
.strength, .earth
  color #6D4C41
.intelligence, .fire
  color #F39C12
.chance, .water
  color #2980B9
.agility, .air
  color #27AE60
.speed
  color #00C853
.reach
  color #C51162
.haste
  color #304FFE

.placeholder
  display flex
  justify-content center
  align-items center
  width 400px
  height 100px

.item__container
  display flex
  padding 2em 1em
  flex-flow column nowrap
  width 100%
  height max-content
  overflow hidden
  overflow-y auto
  height calc(100vh - 50px - 1em)

  .item__set
    display flex
    width 100%
    flex-flow column nowrap
    .set_name
      display flex
      flex-flow row nowrap
      width 100%
      margin-bottom .25em
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
          width 2px
          bottom 0
          border-radius 3px
          background var(--color-primary)
    .set_bonus
      display flex
      flex-flow row nowrap
      .bonus
        border 1px dotted black
        display flex
        flex-flow column nowrap
        margin 1em 1em 0 1em
        padding 1em
        span
          opacity .8
        .stat
          display flex
          flex-flow row nowrap
          height 17px
          .name
            text-transform uppercase
            font-size .7em
            width 90px
            font-weight 900

  .item__middle
    display flex
    flex-flow row nowrap
    width 100%
    align-items center
    .left
      width 40%
      >div
        display flex
        flex-flow column nowrap
        padding-top .5em
        // width 200px

        .inner
          color #34495E
          font-weight 600
        >span
          width 100px
          text-transform uppercase
          font-size .7em
          font-weight 900
      .multiple
        display flex
        flex-flow row nowrap
        .bonus
          margin-left .5em
          display flex
          flex-flow row nowrap
        .sep
          margin 0 .5em
      .stats
        flex-flow column nowrap
        .stat
          margin-left 1em
          display flex
          .to
            padding 0 1em
            text-transform uppercase
            font-size .7em
            font-weight 900
          .name
            text-transform uppercase
            font-size .7em
            width 100px
            font-weight 900
      .name
        display flex
        flex-flow row nowrap
        width 100%
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
    .right
      display flex
      flex-flow column nowrap
      justify-content center
      .upload
        margin-bottom 1em
        width 600px
        // height 500px
        // display flex
        // justify-content center
        // align-items center
      .three
        border 1px solid rgba(#7F8C8D .4)
        border-radius 12px

      .img_container
        width 600px
        height 500px
        display flex
        justify-content center
        align-items center
        img
          width 128px
          image-rendering pixelated

      .change, .remove
        margin .5em 0

  .full
    width 100% !important

  pre
    margin-top 3em
    white-space pre-wrap
    code
      border-radius 10px
      box-shadow 10px 10px 10px #bebebe, -10px -10px 10px #ffffff

.new_damage_row
  display flex
  width 100px
  height 40px
  border-radius 12px
  border 1px dashed
  margin-left 1em
  justify-content center
  align-items center
  position relative
  cursor pointer
  font-weight 900
  font-size .8em
  opacity .8
  &::before
    content ''
    width 15px
    height @width
    border-left 1px solid
    border-bottom 1px solid
    border-color black
    opacity .4
    position absolute
    top 15%
    left -15px
    border-bottom-left-radius 5px

.damage_row
  display flex
  flex-flow row nowrap
  position relative
  margin-left 1em
  align-items center
  height 40px
  // min-width 350px
  width max-content
  border-radius 12px
  padding 0 1em 0 .5em
  margin-bottom .5em
  border 1px solid

  .del
    position absolute
    top 50%
    right -35px
    transform translateY(-50%)
  &.earth
    border-color #6D4C41
    &::before
      border-color #6D4C41
  &.fire
    border-color #F39C12
    &::before
      border-color #F39C12
  &.water
    border-color #2980B9
    &::before
      border-color #2980B9
  &.air
    border-color #27AE60
    &::before
      border-color #27AE60
  &::before
    content ''
    width 15px
    height @width
    border-left 1px solid
    border-bottom 1px solid
    position absolute
    top 15%
    left -15px
    border-bottom-left-radius 5px
  .sep
    padding 0 .5em
    color #212121
  .q-select
    margin .5em
    height max-content
    min-width 100px
  .field
    .inner
      color inherit !important
      margin 0 .25em
      &.right
        margin-right 1em

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
