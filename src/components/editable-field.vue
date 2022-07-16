<template lang="pug">
.field
  slot(v-if="!edit" :click="() => edit = true")
  q-input(v-else @blur="validate" @keyup.enter="$event.target.blur()" :model-value="props.modelValue")
</template>

<script setup>
import { ref } from 'vue';

const edit = ref(false);
const props = defineProps(['modelValue']);
const emits = defineEmits(['update:modelValue']);
const validate = ({ target: { value } }) => {
  edit.value = false;
  emits('update:modelValue', value);
};
</script>
