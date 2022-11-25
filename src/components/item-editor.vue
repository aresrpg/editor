<template lang="pug">
.item__container
  //- name
  .item__middle
    .left
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
      .item(v-if="readable.type === 'misc'")
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
      q-upload(
        :value="uploaded_files"
        :accept="['application/JSON', 'image/png']"
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
      img.texture(v-else-if="item_texture || default_texture" :src="create_url(item_texture ?? default_texture)")
      .placeholder(v-else) The default texture is not present in the resources pack
      q-button.change(size="small" theme="secondary" @click="show_texture_upload = true") set texture

  pre(v-highlightjs v-if="show_json")
    code.json {{ readable }}
</template>

<script setup>
import { computed, inject, watch, reactive, ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';

import minecraft_items from '../core/minecraft_items.json';
import Editors from '../core/Editors.js';
import { normalize_item, types, statistics } from '../core/items.js';
import Folders from '../core/Folders';
import { save_file } from '../core/directories.js';

import field from './editable-field.vue';
import options from './editable-select.vue';
import textField from './editable-text.vue';
import three from './three.vue';

const props = defineProps(['id', 'listen_deletion']);
const emits = defineEmits(['update']);
const items = inject(Folders.ARESRPG).data['items.json'];

const RESOURCES = inject(Folders.RESOURCES);
const ARESRPG_HANDLE = inject(`${Folders.ARESRPG}:handle`);
const RESOURCES_HANDLE = inject(`${Folders.RESOURCES}:handle`);

const show_texture_upload = ref(false);
const uploaded_files = ref([]);

const toast = useToast();
const on_clear_model = file_id => {
  uploaded_files.value = uploaded_files.value.filter(
    ({ id }) => id !== file_id
  );
};

const on_upload_model = async (sourceFile, file_id) => {
  uploaded_files.value.push({
    id: file_id,
    sourceFile,
    name: sourceFile.name,
  });
};

const file_extension = file_name => {
  const parts = file_name.split('.');
  if (parts.length > 1) return parts.pop();
};

const all_files_uploaded = computed(() => uploaded_files.value.length === 2);

const create_url = blob => URL.createObjectURL(blob);

const item_model = computed(() => {
  const {
    assets: {
      minecraft: {
        models: { custom: { [`${props.id}.json`]: model } = {} },
      },
    },
  } = RESOURCES;
  return model;
});
const item_texture = computed(() => {
  const {
    assets: {
      minecraft: {
        textures: { custom: { [`${props.id}.png`]: texture } = {} },
      },
    },
  } = RESOURCES;
  if (texture) return texture;
});
const default_texture = computed(() => {
  const {
    assets: {
      minecraft: {
        textures: { item: { [`${items[props.id].item}.png`]: texture } = {} },
      },
    },
  } = RESOURCES;
  if (texture) return texture;
});
const item_mcmeta = computed(() => {
  const {
    assets: {
      minecraft: {
        textures: { custom: { [`${props.id}.mcmeta`]: mcmeta } = {} },
      },
    },
  } = RESOURCES;
  return mcmeta;
});

const is_3D_model = computed(() => {
  const model = item_model.value ?? {};
  return 'elements' in model;
});

const writable = reactive({
  name: 'name missing',
  level: 1,
  type: 'misc',
  item: 'stone',
  enchanted: true,
  critical: [1, 50],
  damage: [1, 1],
  stats: {
    vitality: [],
    mind: [],
    strength: [],
    intelligence: [],
    chance: [],
    agility: [],
  },
  description: '',
  custom_model_data: 0,
});
const readable = computed(() => normalize_item(writable));

watch(props, ({ id }) => Object.assign(writable, items[id]), {
  deep: true,
  immediate: true,
});
watch(writable, value => emits('update', normalize_item(value)));

const save_custom_model_data = async () => {
  const file_name = `${readable.item}.json`;
  const source_item_json = {
    overrides: [],
    ...(RESOURCES.assets.minecraft.models.item[file_name] ?? {
      parent: 'minecraft:item/generated',
      textures: {
        layer0: `minecraft:item/${readable.item}`,
      },
    }),
  };

  const unused_index = source_item_json.overrides.reduce(
    (last, { predicate: { custom_model_data: current_data } }) =>
      last + current_data + 1,
    1
  );

  source_item_json.overrides.push({
    predicate: { custom_model_data: unused_index },
    model: `custom/${props.id}`,
  });

  RESOURCES.assets.minecraft.models.item[file_name] = source_item_json;

  await save_file({
    directory_handle: RESOURCES_HANDLE.value,
    file_name,
    file_content: JSON.stringify(source_item_json),
    file_path: ['assets', 'minecraft', 'models', 'item'],
  });
};

const delete_custom_model_data = async ({ file_name }) => {
  const source_item_json = RESOURCES.assets.minecraft.models.item[file_name];
  if (!source_item_json.overrides?.length) return;
  source_item_json.overrides = source_item_json.overrides.filter(
    ({ predicate }) => predicate.custom_model_data !== custom_model_data
  );

  await save_file({
    directory_handle: RESOURCES_HANDLE.value,
    file_name,
    file_content: JSON.stringify(source_item_json),
    file_path: ['assets', 'minecraft', 'models', 'item'],
  });
};

const delete_element = id => {
  const model_name = `${id}.json`;
  const texture_name = `${id}.png`;
  const mcmeta_name = `${id}.mcmeta`;

  delete RESOURCES.assets.minecraft.models.custom[model_name];
  delete RESOURCES.assets.minecraft.textures.custom[texture_name];
  delete RESOURCES.assets.minecraft.textures.custom[mcmeta_name];
};

defineExpose({ delete_element });

const on_confirm_texture = async () => {
  if (all_files_uploaded.value) {
    const find_file = type =>
      uploaded_files.value.find(({ name }) => file_extension(name) === type)
        ?.sourceFile;
    const model = find_file('json');
    const texture = find_file('png');
    const mcmeta = find_file('mcmeta');
    if (model && texture) {
      const { value: directory_handle } = RESOURCES_HANDLE;
      const model_name = `${props.id}.json`;
      const texture_name = `${props.id}.png`;
      const mcmeta_name = `${props.id}.mcmeta`;

      RESOURCES.assets.minecraft.models.custom[model_name] = JSON.parse(
        await model.text()
      );
      RESOURCES.assets.minecraft.textures.custom[texture_name] = texture;

      if (mcmeta) {
        RESOURCES.assets.minecraft.textures.custom[mcmeta_name] = JSON.parse(
          await mcmeta.text()
        );
        await save_file({
          directory_handle,
          file_name: mcmeta_name,
          file_content: mcmeta,
          file_path: ['assets', 'minecraft', 'textures', 'custom'],
        });
      }

      await save_file({
        directory_handle,
        file_name: model_name,
        file_content: model,
        file_path: ['assets', 'minecraft', 'models', 'custom'],
      });

      await save_file({
        directory_handle,
        file_name: texture_name,
        file_content: texture,
        file_path: ['assets', 'minecraft', 'textures', 'custom'],
      });

      await save_custom_model_data();
    } else
      toast('Are you sure you uploaded a model.json and a texture.png ?', {
        type: 'error',
      });
  }
  show_texture_upload.value = false;
};

const show_json = inject(`${Editors.ITEMS}:json`);
</script>

<style lang="stylus" scoped>

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
        width 200px

        .inner
          color #34495E
          font-weight 600
        >span
          width 100px
          text-transform uppercase
          font-size .7em
          font-weight 900
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
      .three
        border 1px solid rgba(#7F8C8D .4)
        border-radius 12px

      img
        width 128px
        image-rendering pixelated

      .change
        margin-top 1em



  .full
    width 100% !important

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
