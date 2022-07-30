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

const safe_parse = value => {
  try {
    if (value) return JSON.parse(value);
  } catch {}
};

export default (key, default_value = null) => {
  return stored({
    key,
    variable: ref(safe_parse(localStorage.getItem(key)) ?? default_value),
  });
};
