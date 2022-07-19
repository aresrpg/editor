import { reactive, ref, watch } from 'vue';

const stored = ({ variable, key }) => {
  watch(
    variable,
    to => {
      localStorage.setItem(key, JSON.stringify(to));
    },
    { deep: true }
  );

  return variable;
};

export const stored_ref = (key, default_value = null) => {
  return stored({
    key,
    variable: ref(
      JSON.parse(localStorage.getItem(key) ?? JSON.stringify(default_value))
    ),
  });
};

export const stored_reactive = (key, default_value = {}) => {
  return stored({
    key,
    variable: reactive(
      JSON.parse(localStorage.getItem(key) ?? JSON.stringify(default_value))
    ),
  });
};
