import { delete_file, save_file } from './directories.js'

export const equipments = [
  'helmet',
  'chestplate',
  'leggings',
  'boots',
  'necklace',
  'ring',
  'belt',
  'shield',
]

export const weapons = ['sword', 'axe', 'bow', 'stick']

export const types = [...equipments, ...weapons, 'misc', 'consumable']
export const elements = ['earth', 'fire', 'water', 'air']
export const damage_types = ['damage', 'life_steal', 'heal']
export const statistics = [
  'vitality',
  'mind',
  'strength',
  'intelligence',
  'chance',
  'agility',
  'speed',
  'reach',
  'haste',
  'raw_damage',
]

export const DEFAULT_ITEM = {
  name: 'name missing',
  level: 1,
  type: 'misc',
  item: 'magma_cream',
  enchanted: false,
  critical: { outcomes: 50, bonus: 5 },
  damage: [{ from: 1, to: 1, element: 'earth', type: 'damage' }],
  stats: {
    vitality: [],
    mind: [],
    strength: [],
    intelligence: [],
    chance: [],
    agility: [],
    speed: [],
    reach: [],
    haste: [],
    raw_damage: [],
  },
  description: '',
  custom_model_data: 0,
}

export const DEFAULT_SET = {
  name: 'name missing',
  stats: [],
  items: [],
}

const to_range = value => {
  if (Array.isArray(value)) {
    const [from = 0, to = 0] = value
    return [+from, Math.max(+from, +to)]
  }
  return []
}

const to_number = value => (globalThis.isNaN(value) ? 0 : +value)

export const normalize_set = ({
  name: unsafe_name,
  stats: unsafe_stats = {},
  items: unsafe_items = [],
}) => ({
  name: unsafe_name?.trim() ?? 'name missing',
  // `item_amount` represent how many item the player needs to equip to gain the stats
  stats: Object.fromEntries(
    Object.entries(unsafe_stats)
      .filter(([item_amount]) => item_amount > 1 || item_amount <= 8)
      .sort(([key_a], [key_b]) => key_a - key_b)
      .map(
        ([
          item_amount,
          {
            vitality: unsafe_vitality,
            mind: unsafe_mind,
            strength: unsafe_strength,
            intelligence: unsafe_intelligence,
            chance: unsafe_chance,
            agility: unsafe_agility,
            speed: unsafe_speed,
            reach: unsafe_reach,
            haste: unsafe_haste,
            raw_damage: unsafe_raw_damage,
          } = {},
        ]) => [
          item_amount,
          {
            vitality: to_number(unsafe_vitality),
            mind: to_number(unsafe_mind),
            strength: to_number(unsafe_strength),
            intelligence: to_number(unsafe_intelligence),
            chance: to_number(unsafe_chance),
            agility: to_number(unsafe_agility),
            speed: to_number(unsafe_speed),
            reach: to_number(unsafe_reach),
            haste: to_number(unsafe_haste),
            raw_damage: to_number(unsafe_raw_damage),
          },
        ]
      )
  ),
  items: unsafe_items.filter(item => typeof item === 'string'),
})

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
    case 'shield':
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

// make sure a damage object has the correct format
const format_damage = ({ from, to, type, element } = {}) => {
  const formatted = {
    from: !globalThis.isNaN(from) ? +from : 1,
    to: !globalThis.isNaN(to) ? +to : 1,
    type: damage_types.includes(type) ? type : 'damage',
  }
  if (type === 'heal') return formatted
  return {
    ...formatted,
    element: elements.includes(element) ? element : 'earth',
  }
}

export const normalize_item = ({
  name: unsafe_name,
  level: unsafe_level,
  type,
  custom_model_data = 0,
  enchanted: unsafe_enchanted,
  critical: { outcomes: unsafe_crit_outcomes, bonus: unsafe_bonus } = {},
  damage: unsafe_damage,
  stats: {
    vitality: unsafe_vitality = [],
    mind: unsafe_mind = [],
    strength: unsafe_strength = [],
    intelligence: unsafe_intelligence = [],
    chance: unsafe_chance = [],
    agility: unsafe_agility = [],
    speed: unsafe_speed = [],
    reach: unsafe_reach = [],
    haste: unsafe_haste = [],
    raw_damage: unsafe_raw_damage = [],
  } = {},
  description: unsafe_description = '',
}) => {
  const name = unsafe_name?.trim() ?? 'name missing'
  const level = +unsafe_level || 1
  const item = map_minecraft_item(type)
  const enchanted = !!unsafe_enchanted

  const stats = {
    vitality: to_range(unsafe_vitality),
    mind: to_range(unsafe_mind),
    strength: to_range(unsafe_strength),
    intelligence: to_range(unsafe_intelligence),
    chance: to_range(unsafe_chance),
    agility: to_range(unsafe_agility),
    speed: to_range(unsafe_speed),
    reach: to_range(unsafe_reach),
    haste: to_range(unsafe_haste),
    raw_damage: to_range(unsafe_raw_damage),
  }

  const critical = {
    outcomes: !globalThis.isNaN(unsafe_crit_outcomes)
      ? +unsafe_crit_outcomes
      : 50,
    bonus: !globalThis.isNaN(unsafe_bonus) ? +unsafe_bonus : 5,
  }
  const damage = Array.isArray(unsafe_damage)
    ? unsafe_damage.map(format_damage)
    : []
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
    case 'shield':
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
