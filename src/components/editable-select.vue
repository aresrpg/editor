<template lang="pug">
.field
  slot(v-if="!edit" :click="() => edit = true")
  q-select(
    v-else
    @update:modelValue="validate"
    :modelValue="props.modelValue"
    autofocus
    autocomplete="on"
    filterable
    v-click-outside="() => validate()"
  )
    q-option(
      v-for="option in props.options"
      :key="option"
      :label="option"
      :value="option"
    )
</template>

<script setup>
import { ref, watchEffect } from 'vue'

const edit = ref(false)
const props = defineProps(['modelValue', 'options', 'get_key', 'width'])
const emits = defineEmits(['update:modelValue'])
const width = ref('100px')

watchEffect(() => {
  if (props.width) width.value = props.width
})

const validate = value => {
  if (value) emits('update:modelValue', value)
  edit.value = false
}
</script>

<style lang="stylus" scoped>
.field
  cursor pointer
  .q-select
    width v-bind(width)
</style>
