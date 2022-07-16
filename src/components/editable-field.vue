<template lang="pug">
.field
  slot(v-if="!edit" :click="() => edit = true")
  component(
    v-else
    :is="props.numeric ? 'q-input-number' : 'q-input'"
    :class="props"
    @blur="({ target: { value }}) => validate(value)"
    @keyup.enter="$event.target.blur()"
    :model-value="props.numeric ? +props.modelValue : props.modelValue"
    autofocus
    :min="1"
  )
</template>

<script setup>
import { ref } from 'vue';

const edit = ref(false);
const props = defineProps(['modelValue', 'numeric']);
const emits = defineEmits(['update:modelValue']);
const validate = value => {
  const trimmed = value?.trim();
  if (trimmed) emits('update:modelValue', trimmed);
  edit.value = false;
};
</script>

<style lang="stylus">
.field
  input.numeric
    width 60px
</style>
