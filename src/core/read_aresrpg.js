import { useToast } from 'vue-toastification';

import Files from './Files.js';
import { normalize_item } from './items.js';

const Option = {
  [Files.ITEMS]: {
    key: Files.ITEMS,
    fields: ['name', 'item', 'type'],
    normalize: normalize_item,
  },
  [Files.ENTITIES]: {
    key: Files.ENTITIES,
    fields: ['minecraft_entity', 'category', 'display_name'],
    normalize: x => x,
  },
};

const to_array = async aiter => {
  const result = [];
  for await (const x of aiter) result.push(x);
  return result;
};

const by_name =
  name =>
  ([key]) =>
    key === name;

const cd = file_name => directory_handle =>
  Promise.resolve(directory_handle.entries())
    .then(to_array)
    .then(elements => elements.filter(by_name(file_name)).flat())
    .then(([, handle]) => handle);

const file_content = file_handle =>
  file_handle
    .getFile()
    .then(file => file.text())
    .then(text => JSON.parse(text));

const normalize_file =
  ({ normalize }) =>
  content =>
    Object.fromEntries(
      Object.entries(content).map(([key, value]) => [key, normalize(value)])
    );

const verify_file =
  ({ fields, key }) =>
  content => {
    const verified = Object.values(content).every(object =>
      fields.every(field => field in object)
    );
    if (!verified) throw new Error(`Fields of the ${key} file are invalid`);
  };

const tap = handle => x => {
  handle(x);
  return x;
};

const toast = useToast();

export default async directory_handle => {
  try {
    const data_folder = Promise.resolve(directory_handle).then(cd('data'));
    const [items, entities] = await Promise.all(
      [Files.ITEMS, Files.ENTITIES].map(path =>
        data_folder
          .then(cd(path))
          .then(file_content)
          .then(normalize_file(Option[path]))
          .then(tap(verify_file(Option[path])))
      )
    );

    return {
      items,
      entities,
    };
  } catch {
    toast(`This doesn't seem to be the correct folder 😞`, { type: 'error' });
  }
};
