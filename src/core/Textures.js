import { save_file, delete_file } from './directories'

const default_item_json = item => ({
  parent: 'minecraft:item/generated',
  textures: {
    layer0: `minecraft:item/${item}`,
  },
  overrides: [],
})

const default_model_json = item => ({
  credit: 'AresRPG generated | https://aresrpg.world',
  texture_size: [32, 32],
  textures: {
    0: `custom/${item}`,
  },
})

const get_unused_index = item_json =>
  item_json.overrides.reduce(
    (_, { predicate: { custom_model_data: current = 0 } }) => current + 1,
    0
  )

export default ({ RESOURCES, RESOURCES_HANDLE, item, item_id }) => {
  const item_filename = `${item}.json`
  const texture_filename = `${item_id}.png`
  const model_filename = `${item_id}.json`
  const mcmeta_filename = `${item_id}.mcmeta`

  const base_json =
    RESOURCES.assets.minecraft.models.item[item_filename] ??
    default_item_json(item)

  return {
    async set_texture({ custom_texture, custom_model_json, custom_mcmeta }) {
      const custom_model_data = get_unused_index(base_json)
      const override = {
        predicate: { custom_model_data },
        model: `custom/${item_id}`,
      }
      const item_json = {
        ...base_json,
        overrides: [...base_json.overrides, override],
      }

      const model_json = custom_model_json ?? default_model_json(item)

      RESOURCES.assets.minecraft.models.item[item_filename] = item_json
      RESOURCES.assets.minecraft.models.custom[model_filename] = model_json
      RESOURCES.assets.minecraft.textures.custom[texture_filename] =
        custom_texture

      if (custom_mcmeta) {
        RESOURCES.assets.minecraft.textures.custom[mcmeta_filename] =
          custom_mcmeta

        // save mcmeta file (for texture animation)
        await save_file({
          directory_handle: RESOURCES_HANDLE,
          file_name: mcmeta_filename,
          file_content: custom_mcmeta,
          file_path: ['assets', 'minecraft', 'textures', 'custom'],
        })
      }

      // save models/item/<item>.json file (which points to the model)
      await save_file({
        directory_handle: RESOURCES_HANDLE,
        file_name: item_filename,
        file_content: JSON.stringify(item_json, null, 2),
        file_path: ['assets', 'minecraft', 'models', 'item'],
      })

      // save models/custom/<id>.json file (which points to the texture)
      await save_file({
        directory_handle: RESOURCES_HANDLE,
        file_name: model_filename,
        file_content: JSON.stringify(model_json, null, 2),
        file_path: ['assets', 'minecraft', 'models', 'custom'],
      })

      // save textures/custom/<id>.png
      await save_file({
        directory_handle: RESOURCES_HANDLE,
        file_name: texture_filename,
        file_content: custom_texture,
        file_path: ['assets', 'minecraft', 'textures', 'custom'],
      })

      return custom_model_data
    },

    async delete_texture(custom_model_data) {
      const item_json = {
        ...base_json,
        overrides: base_json.overrides.filter(
          ({ predicate }) => predicate.custom_model_data !== custom_model_data
        ),
      }

      delete RESOURCES.assets.minecraft.models.item[item_filename]
      delete RESOURCES.assets.minecraft.models.custom[model_filename]
      delete RESOURCES.assets.minecraft.textures.custom[texture_filename]

      // save models/item/<item>.json file (which points to the model)
      await save_file({
        directory_handle: RESOURCES_HANDLE,
        file_name: item_filename,
        file_content: JSON.stringify(item_json, null, 2),
        file_path: ['assets', 'minecraft', 'models', 'item'],
      })

      // ignoring errors in all thoses as files may not exists and its fine
      await delete_file({
        directory_handle: RESOURCES_HANDLE,
        file_name: model_filename,
        file_path: ['assets', 'minecraft', 'models', 'custom'],
      }).catch(() => {})

      await delete_file({
        directory_handle: RESOURCES_HANDLE,
        file_name: texture_filename,
        file_path: ['assets', 'minecraft', 'textures', 'custom'],
      }).catch(() => {})

      await delete_file({
        directory_handle: RESOURCES_HANDLE,
        file_name: mcmeta_filename,
        file_path: ['assets', 'minecraft', 'textures', 'custom'],
      }).catch(() => {})
    },
  }
}
