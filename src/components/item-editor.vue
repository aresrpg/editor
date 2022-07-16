<template lang="pug">
editor(:key_name="Files.ITEMS")
  template(#default="{ selected }")
    .selected__container(v-if="selected")
      field(v-model="selected.name")
        template(#default="{ click }")
          .title(@click="click") {{ selected.name }}
</template>

<script setup>
import Files from '../Files';

import field from './editable-field.vue';
import editor from './editor.vue';
</script>

<style lang="stylus" scoped>
.selected__container
  display flex
  padding 2em 1em
  flex-flow column nowrap
  width 100%
  .title
    position relative
    font-size 1.6em
    height max-content
    padding-left .5em
    &::before
      content ''
      position absolute
      top 0
      left 0
      width 5px
      bottom 0
      border-radius 3px
      background var(--color-primary)
</style>
