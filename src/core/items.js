import minecraft_items from './minecraft_items.json';

const equipments = [
  'helmet',
  'chestplate',
  'leggings',
  'boots',
  'necklace',
  'ring',
  'belt',
];

const weapons = ['sword', 'axe', 'bow', 'stick'];

export const types = [...equipments, ...weapons, 'misc', 'money', 'consumable'];

export const statistics = [
  'vitality',
  'mind',
  'strength',
  'intelligence',
  'chance',
  'agility',
];

const map_minecraft_item = type => {
  switch (type) {
    case 'helmet':
      return 'stone';
    case 'chestplate':
      return 'leather_chestplate';
    case 'leggings':
      return 'leather_leggings';
    case 'boots':
      return 'leather_boots';
    case 'consumable':
      return 'potion';
    case 'sword':
      return 'iron_sword';
    case 'axe':
      return 'iron_axe';
    case 'bow':
      return 'bow';
    case 'stick':
      return 'stick';
    case 'misc':
      if (minecraft_items.includes(type)) return type;
    default:
      return 'magma_cream';
  }
};

const to_range = value => (Array.isArray(value) ? value : []);

export const normalize_item = ({
  name: unsafe_name,
  level: unsafe_level,
  type,
  item: unsafe_item,
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
  const name = unsafe_name?.trim() ?? 'name missing';
  const level = unsafe_level || 1;
  const item = map_minecraft_item(type);
  const enchanted = !!unsafe_enchanted;

  const stats = {
    vitality: to_range(unsafe_vitality),
    mind: to_range(unsafe_mind),
    strength: to_range(unsafe_strength),
    intelligence: to_range(unsafe_intelligence),
    chance: to_range(unsafe_chance),
    agility: to_range(unsafe_agility),
  };

  const critical = Array.isArray(unsafe_critical)
    ? unsafe_critical.slice(0, 2).map(x => Math.abs(x))
    : [1, 50];
  const damage = Array.isArray(unsafe_damage)
    ? unsafe_damage.slice(0, 2).map(x => Math.abs(x))
    : [1, 1];
  const description = Array.isArray(unsafe_description)
    ? unsafe_description.join(' ')
    : unsafe_description;

  const mandatory_fields = {
    name,
    type,
    item,
    custom_model_data,
    enchanted,
    description,
  };

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
      };
    case 'money':
      return {
        ...mandatory_fields,
        name: 'kAres',
        item: 'gold_ingot',
        description:
          'En regardant de plus pres on peut meme y voir la tete de sceat, sa valeure est inestimable',
      };
    case 'consumable':
      return {
        ...mandatory_fields,
        level,
      };
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
      };
    default:
      return {
        ...mandatory_fields,
        type: 'misc',
      };
  }
};
