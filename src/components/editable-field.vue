<template lang="pug">
.field(:class="props.element")
  slot(v-if="!edit" :click="allow_edit")
    div(@click="allow_edit") {{ props.modelValue }}
  component(
    v-else
    :is="props.numeric ? 'q-input-number' : 'q-input'"
    @blur="({ target: { value }}) => validate(value)"
    @keydown.enter="$event.target.blur()"
    :model-value="props.numeric ? +props.modelValue : props.modelValue"
    ref="input"
    :style="{ width: props.numeric ? '60px' : '200px'}"
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
const props = defineProps(['modelValue', 'numeric', 'allowNegative', 'element'])
const emits = defineEmits(['update:modelValue'])
const validate = value => {
  const trimmed = value?.trim().replaceAll(',', '') // weird but it adds ',' for thousands
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

<style lang="stylus" scoped>
.field
  cursor pointer

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
</style>
