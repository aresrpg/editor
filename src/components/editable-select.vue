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
import { ref } from 'vue'

const edit = ref(false)
const props = defineProps(['modelValue', 'options', 'get_key'])
const emits = defineEmits(['update:modelValue'])
const validate = value => {
  if (value) emits('update:modelValue', value)
  edit.value = false
}
</script>
