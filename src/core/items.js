import { delete_file, save_file } from './directories.js'

const equipments = [
  'helmet',
  'chestplate',
  'leggings',
  'boots',
  'necklace',
  'ring',
  'belt',
]

const weapons = ['sword', 'axe', 'bow', 'stick']

export const types = [...equipments, ...weapons, 'misc', 'consumable']

export const statistics = [
  'vitality',
  'mind',
  'strength',
  'intelligence',
  'chance',
  'agility',
]

const map_minecraft_item = type => {
  switch (type) {
    case 'chestplate':
      return 'leather_chestplate'
    case 'leggings':
      return 'leather_leggings'
    case 'boots':
      return 'leather_boots'
    case 'consumable':
      return 'potion'
    case 'bow':
    case 'helmet':
    case 'sword':
    case 'axe':
    case 'stick':
    case 'misc':
    default:
      return 'magma_cream'
  }
}

const to_range = value => {
  if (Array.isArray(value)) {
    const [from = 0, to = 0] = value
    return [+from, +to]
  }
  return []
}

export const normalize_item = ({
  name: unsafe_name,
  level: unsafe_level,
  type,
  custom_model_data = 0,
  enchanted: unsafe_enchanted,
  critical: unsafe_critical,
  damage: unsafe_damage,
  stats: {
    vitality: unsafe_vitality = [],
    mind: unsafe_mind = [],
    strength: unsafe_strength = [],
    intelligence: unsafe_intelligence = [],
    chance: unsafe_chance = [],
    agility: unsafe_agility = [],
  } = {},
  description: unsafe_description = '',
}) => {
  const name = unsafe_name?.trim() ?? 'name missing'
  const level = unsafe_level || 1
  const item = map_minecraft_item(type)
  const enchanted = !!unsafe_enchanted

  const stats = {
    vitality: to_range(unsafe_vitality),
    mind: to_range(unsafe_mind),
    strength: to_range(unsafe_strength),
    intelligence: to_range(unsafe_intelligence),
    chance: to_range(unsafe_chance),
    agility: to_range(unsafe_agility),
  }

  const critical = Array.isArray(unsafe_critical)
    ? unsafe_critical.slice(0, 2).map(x => Math.abs(x))
    : [1, 50]
  const damage = Array.isArray(unsafe_damage)
    ? unsafe_damage.slice(0, 2).map(x => Math.abs(x))
    : [1, 1]
  const description = Array.isArray(unsafe_description)
    ? unsafe_description.join(' ')
    : unsafe_description

  const mandatory_fields = {
    name,
    type,
    item,
    custom_model_data,
    enchanted,
    description,
  }

  switch (type) {
    case 'helmet':
    case 'chestplate':
    case 'leggings':
    case 'boots':
    case 'necklace':
    case 'ring':
    case 'belt':
      return {
        ...mandatory_fields,
        level,
        stats,
      }
    case 'consumable':
      return {
        ...mandatory_fields,
        level,
      }
    case 'sword':
    case 'axe':
    case 'bow':
    case 'stick':
      return {
        ...mandatory_fields,
        level,
        stats,
        critical,
        damage,
      }
    default:
      return {
        ...mandatory_fields,
        type: 'misc',
      }
  }
}

export const delete_texture = async ({
  RESOURCES,
  RESOURCES_HANDLE,
  id,
  custom_model_data,
  item,
}) => {
  const delete_custom_model_data = async ({ file_name, custom_model_data }) => {
    const source_item_json = RESOURCES.assets.minecraft.models.item[file_name]
    if (!source_item_json.overrides?.length) return
    source_item_json.overrides = source_item_json.overrides.filter(
      ({ predicate }) => predicate.custom_model_data !== custom_model_data
    )

    await save_file({
      directory_handle: RESOURCES_HANDLE,
      file_name,
      file_content: JSON.stringify(source_item_json, null, 2),
      file_path: ['assets', 'minecraft', 'models', 'item'],
    })
  }
  const model_name = `${id}.json`
  const texture_name = `${id}.png`
  const mcmeta_name = `${id}.mcmeta`

  delete RESOURCES.assets.minecraft.models.custom[model_name]
  delete RESOURCES.assets.minecraft.textures.custom[texture_name]
  delete RESOURCES.assets.minecraft.textures.custom[mcmeta_name]

  // ignoring errors in all thoses as files may not exists and its fine
  await delete_file({
    directory_handle: RESOURCES_HANDLE,
    file_name: model_name,
    file_path: ['assets', 'minecraft', 'models', 'custom'],
  }).catch(() => {})
  await delete_file({
    directory_handle: RESOURCES_HANDLE,
    file_name: texture_name,
    file_path: ['assets', 'minecraft', 'textures', 'custom'],
  }).catch(() => {})
  await delete_file({
    directory_handle: RESOURCES_HANDLE,
    file_name: mcmeta_name,
    file_path: ['assets', 'minecraft', 'textures', 'custom'],
  }).catch(() => {})
  await delete_custom_model_data({
    file_name: `${item}.json`,
    custom_model_data,
  })
}
