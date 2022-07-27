import minecraft_items from './minecraft_items.js';

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

export const normalize_item = ({
  name: unsafe_name,
  level: unsafe_level,
  type,
  item: unsafe_item,
  enchanted: unsafe_enchanted,
  critical: unsafe_critical,
  damage: unsafe_damage,
  stats: {
    vitality = 0,
    mind = 0,
    strength = 0,
    intelligence = 0,
    chance = 0,
    agility = 0,
  } = {},
  description: unsafe_description = '',
}) => {
  const name = unsafe_name?.trim() ?? 'name missing';
  const level = unsafe_level || 1;
  const item = map_minecraft_item(type);
  const enchanted = !!unsafe_enchanted;
  const stats = {
    vitality,
    mind,
    strength,
    intelligence,
    chance,
    agility,
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

  switch (type) {
    case 'helmet':
    case 'chestplate':
    case 'leggings':
    case 'boots':
    case 'necklace':
    case 'ring':
    case 'belt':
      return {
        name,
        level,
        type,
        item,
        enchanted,
        stats,
        description,
      };
    case 'money':
      return {
        name: 'kAres',
        type,
        item: 'gold_ingot',
        description:
          'En regardant de plus pres on peut meme y voir la tete de sceat, sa valeure est inestimable',
      };
    case 'consumable':
      return {
        name,
        level,
        type,
        item,
        enchanted,
        description,
      };
    case 'sword':
    case 'axe':
    case 'bow':
    case 'stick':
      return {
        name,
        level,
        type,
        item,
        enchanted,
        stats,
        critical,
        damage,
        description,
      };
    default:
      return {
        name,
        type: 'misc',
        item,
        enchanted,
        description,
      };
  }
};
