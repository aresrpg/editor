import minecraft_items from './minecraft_items.js';

export default ({
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
  const item = minecraft_items.includes(unsafe_item) ? unsafe_item : 'stone';
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
    case 'equipment':
      return {
        name,
        level,
        type,
        item,
        enchanted,
        stats,
        description,
      };
    case 'misc':
      return {
        name,
        type,
        item,
        enchanted,
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
    case 'weapon':
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
