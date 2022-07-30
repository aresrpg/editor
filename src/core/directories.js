import { aiter, iter } from 'iterator-helper';

const PERMISSIONS = { mode: 'readwrite' };
const IGNORES = ['node_modules', '.git'];

const file_extension = file_name => {
  const parts = file_name.split('.');
  if (parts.length > 1) return parts.pop();
};

const parse_file = async file => {
  const extension = file_extension(file.name);
  switch (extension) {
    case 'json':
      try {
        return JSON.parse(await file.text());
      } catch {
        return "couldn't parse JSON, it probably contains comments";
      }
    case 'png':
      return file;
    default:
      return null;
  }
};

export const parse_directory = directory_handle =>
  aiter(directory_handle.values())
    .filter(({ name }) => !IGNORES.includes(name))
    .reduce(async (directory, handle) => {
      const { kind, name } = handle;
      if (kind === 'directory')
        return {
          ...directory,
          [name]: await parse_directory(handle),
        };
      return {
        ...directory,
        [name]: await parse_file(await handle.getFile()),
      };
    }, {});

export const save_directory = ({ directory_handle, object }) =>
  iter(Object.entries(object))
    .toAsyncIterator()
    .map(async ([file_name, file_content]) => {
      const extension = file_extension(file_name);
      if (extension) {
        const file_handle = await directory_handle.getFileHandle(file_name, {
          create: true,
        });
        const writable = await file_handle.createWritable();
        await writable.write(file_content);
        await writable.close();
      } else {
        const sub_directory_handle = await directory_handle.getDirectoryHandle(
          file_name,
          { create: true }
        );
        await save_folder({
          directory_handle: sub_directory_handle,
          object: file_content,
        });
      }
    });

export const grant_permission = async handle => {
  const permission = await handle.queryPermission(PERMISSIONS);
  if (permission !== 'granted') await handle.requestPermission(PERMISSIONS);
};
