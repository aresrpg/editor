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
      const file_content = await parse_file(await handle.getFile());
      if (file_content) {
        return {
          ...directory,
          [name]: file_content,
        };
      }
      return directory;
    }, {});

export const grant_permission = async handle => {
  const permission = await handle.queryPermission(PERMISSIONS);
  if (permission !== 'granted') await handle.requestPermission(PERMISSIONS);
};

const with_file_handle =
  then =>
  async ({ directory_handle, file_path, file_name, file_content }) => {
    await grant_permission(directory_handle);
    const current_directory_handle = await iter(file_path)
      .toAsyncIterator()
      .reduce(
        (handle, folder_name) =>
          handle.getDirectoryHandle(folder_name, { create: true }),
        directory_handle
      );
    const file_handle = await current_directory_handle.getFileHandle(
      file_name,
      {
        create: true,
      }
    );
    return then({ file_handle, file_content });
  };

export const save_file = with_file_handle(
  async ({ file_handle, file_content }) => {
    const writable = await file_handle.createWritable();
    await writable.write(file_content);
    await writable.close();
  }
);

// export const delete_file = with_file_handle(file_handle =>
//   file_handle.remove()
// );
