<template lang="pug">
.field
  slot(v-if="!edit" :click="allow_edit")
    div(@click="allow_edit") {{ props.modelValue }}
  component(
    v-else
    :is="props.numeric ? 'q-input-number' : 'q-input'"
    :class="props"
    @blur="({ target: { value }}) => validate(value)"
    @keyup.enter="$event.target.blur()"
    :model-value="props.numeric ? +props.modelValue : props.modelValue"
    ref="input"
    :min="props.allowNegative ? -99999999999 : 1"
    v-click-outside="() => validate()"
  )
</template>

<script setup>
import { nextTick, ref, watchEffect } from 'vue'

const allow_edit = () => {
  edit.value = true
}
const edit = ref(false)
const input = ref()
const props = defineProps(['modelValue', 'numeric', 'allowNegative'])
const emits = defineEmits(['update:modelValue'])
const validate = value => {
  const trimmed = value?.trim()
  if (trimmed) emits('update:modelValue', trimmed)
  edit.value = false
}

watchEffect(() => {
  if (edit.value) {
    nextTick(() => {
      const html_input = input.value.input ?? input.value.inputRef
      html_input.focus()
      html_input.select()
    })
  }
})
</script>

<style lang="stylus">
.field
  cursor pointer
  // max-width 200px
  input.numeric
    width 60px
</style>
