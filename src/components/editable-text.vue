<template lang="pug">
.area
  slot(v-if="!edit" :click="allow_edit")
    div(@click="allow_edit") {{ props.modelValue }}
  textarea(
    v-else
    @blur="({ target: { value }}) => validate(value)"
    @keyup.enter="$event.target.blur()"
    :value="props.modelValue"
    autofocus
    v-click-outside="() => validate()"
  )
</template>

<script setup>
import { ref } from 'vue'

const allow_edit = () => {
  edit.value = true
}
const edit = ref(false)
const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])
const validate = value => {
  const trimmed = value?.trim()
  if (trimmed) emits('update:modelValue', trimmed)
  edit.value = false
}
</script>

<style lang="stylus">
textarea
 border none
 padding 1em
 box-shadow 14px 14px 28px #c7c7c7, -14px -14px 28px #ffffff
 border-radius 12px
 background #eaeaea
 font-size .9em
 color #212121
 min-width 400px
 min-height 100px
</style>
