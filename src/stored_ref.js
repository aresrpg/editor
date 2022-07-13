import { ref, watch } from 'vue';

export default (key, default_value = null) => {
  const variable = ref(
    JSON.parse(localStorage.getItem(key) ?? JSON.stringify(default_value))
  );

  watch(
    variable,
    to => {
      localStorage.setItem(key, JSON.stringify(to));
    },
    { deep: true }
  );

  return variable;
};
