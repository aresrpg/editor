<template lang="pug">
span {{ tweened }}
</template>

<script setup>
import TWEEN from '@tweenjs/tween.js';
import { watch, ref, onMounted, toRefs } from 'vue';

const props = defineProps(['number']);
const { number } = toRefs(props);
const tweened = ref(0);

const tween = (start, end) => {
  const boxed_start = { number: start };
  const boxed_end = { number: end };

  let handler = null;

  const animate = current_time => {
    TWEEN.update(current_time);
    handler = requestAnimationFrame(animate);
  };
  const current_tween = new TWEEN.Tween(boxed_start)
    .to(boxed_end, 400)
    .onUpdate(() => {
      tweened.value = current_tween._object.number.toFixed(0);
    })
    .onComplete(() => {
      cancelAnimationFrame(handler);
      tweened.value = end;
    })
    .start();
  handler = requestAnimationFrame(animate);
};

onMounted(() => tween(0, number.value));
watch(number, (to, from) => {
  tween(from, to);
});
</script>
