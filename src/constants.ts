export const PERK_TYPES = [
  { field: "MODIFIER_PERK", key: "astralsorcery:modifier_perk", group: "generic" },
  { field: "MAJOR_PERK", key: "astralsorcery:major_perk", group: "generic" },
  { field: "KEY_PERK", key: "astralsorcery:key_perk", group: "generic" },
  { field: "GEM_SOCKET_PERK", key: "astralsorcery:gem_socket_perk", group: "generic" },
  { field: "ROOT_PERK_AEVITAS", key: "astralsorcery:root_perk_aevitas", group: "root", constellation: "astralsorcery:aevitas" },
  { field: "ROOT_PERK_ARMARA", key: "astralsorcery:root_perk_armara", group: "root", constellation: "astralsorcery:armara" },
  { field: "ROOT_PERK_DISCIDIA", key: "astralsorcery:root_perk_discidia", group: "root", constellation: "astralsorcery:discidia" },
  { field: "ROOT_PERK_EVORSIO", key: "astralsorcery:root_perk_evorsio", group: "root", constellation: "astralsorcery:evorsio" },
  { field: "ROOT_PERK_VICIO", key: "astralsorcery:root_perk_vicio", group: "root", constellation: "astralsorcery:vicio" },
  { field: "KEY_TELEPORT_DROPS", key: "astralsorcery:key_teleport_drops", group: "key" },
  { field: "KEY_ALL_TOOL_TYPES", key: "astralsorcery:key_all_tool_types", group: "key" },
  { field: "KEY_TREE_CONNECTOR", key: "astralsorcery:key_tree_connector", group: "key" },
  { field: "KEY_NO_KNOCKBACK", key: "astralsorcery:key_no_knockback", group: "key" },
  { field: "KEY_MEND_ARMOR", key: "astralsorcery:key_mend_armor", group: "key" },
  { field: "KEY_ADD_ENCHANTMENTS", key: "astralsorcery:key_add_enchantments", group: "key" },
  { field: "KEY_CLEANSE_NEGATIVE_EFFECTS", key: "astralsorcery:key_cleanse_negative_effects", group: "key" },
  { field: "KEY_CULLING_ATTACK", key: "astralsorcery:key_culling_attack", group: "key" },
  { field: "KEY_DAMAGE_ARMOR", key: "astralsorcery:key_damage_armor", group: "key" },
  { field: "KEY_DISARM", key: "astralsorcery:key_disarm", group: "key" },
  { field: "KEY_REDUCED_FOOD", key: "astralsorcery:key_reduced_food", group: "key" },
  { field: "KEY_CHEAT_DEATH", key: "astralsorcery:key_cheat_death", group: "key" },
  { field: "KEY_DAMAGE_EFFECTS", key: "astralsorcery:key_damage_effects", group: "key" },
  { field: "KEY_PROJECTILE_DISTANCE", key: "astralsorcery:key_projectile_distance", group: "key" },
  { field: "KEY_PROJECTILE_PROXIMITY", key: "astralsorcery:key_projectile_proximity", group: "key" },
  { field: "KEY_LAST_BREATH", key: "astralsorcery:key_last_breath", group: "key" },
  { field: "KEY_NO_ARMOR", key: "astralsorcery:key_no_armor", group: "key" },
  { field: "KEY_RAMPAGE", key: "astralsorcery:key_rampage", group: "key" },
  { field: "KEY_GROW_PLANTS", key: "astralsorcery:key_grow_plants", group: "key" },
] as const;

export type PerkTypeKey = typeof PERK_TYPES[number]["key"];

export const ATTRIBUTE_TYPES = [
  { field: "PERK_EFFECT", key: "astralsorcery:perk_effect" },
  { field: "PERK_EXPERIENCE", key: "astralsorcery:perk_experience" },
  { field: "ARMOR", key: "astralsorcery:armor" },
  { field: "ARMOR_TOUGHNESS", key: "astralsorcery:armor_toughness" },
  { field: "ATTACK_DAMAGE", key: "astralsorcery:attack_damage" },
  { field: "ATTACK_REACH", key: "astralsorcery:attack_reach" },
  { field: "ATTACK_SPEED", key: "astralsorcery:attack_speed" },
  { field: "BLOCK_BREAK_SPEED", key: "astralsorcery:block_break_speed" },
  { field: "BLOCK_REACH", key: "astralsorcery:block_reach" },
  { field: "FALL_DAMAGE", key: "astralsorcery:fall_damage" },
  { field: "LUCK", key: "astralsorcery:luck" },
  { field: "MAX_HEALTH", key: "astralsorcery:max_health" },
  { field: "MOVEMENT_SPEED", key: "astralsorcery:movement_speed" },
  { field: "SAFE_FALL_DISTANCE", key: "astralsorcery:safe_fall_distance" },
  { field: "SCALE", key: "astralsorcery:scale" },
  { field: "STEP_HEIGHT", key: "astralsorcery:step_height" },
  { field: "SWIM_SPEED", key: "astralsorcery:swim_speed" },
  { field: "BLOCK_CHANCE", key: "astralsorcery:block_chance" },
  { field: "COOLDOWN_REDUCTION", key: "astralsorcery:cooldown_reduction" },
  { field: "CRITICAL_HIT_CHANCE", key: "astralsorcery:critical_hit_chance" },
  { field: "CRITICAL_HIT_DAMAGE", key: "astralsorcery:critical_hit_damage" },
  { field: "DAMAGE_REFLECT", key: "astralsorcery:damage_reflect" },
  { field: "ENCHANTMENT_EFFECT", key: "astralsorcery:dynamic_enchantment_effect" },
  { field: "ELEMENTAL_RESISTANCE", key: "astralsorcery:elemental_resistance" },
  { field: "LIFE_LEECH", key: "astralsorcery:life_leech" },
  { field: "LIFE_RECOVERY", key: "astralsorcery:life_recovery" },
  { field: "MINING_SIZE", key: "astralsorcery:mining_size" },
  { field: "PIERCE_ARMOR", key: "astralsorcery:pierce_armor" },
  { field: "POTION_DURATION", key: "astralsorcery:potion_duration" },
  { field: "PROJECTILE_DAMAGE", key: "astralsorcery:projectile_damage" },
  { field: "PROJECTILE_SPEED", key: "astralsorcery:projectile_speed" },
] as const;

export type AttributeKey = typeof ATTRIBUTE_TYPES[number]["key"];

export const MODIFIER_MODES = [
  { field: "ADDITION", mode: 0, label: "+flat" },
  { field: "ADDED_MULTIPLY", mode: 1, label: "+%" },
  { field: "STACKING_MULTIPLY", mode: 2, label: "x%" },
] as const;

export type ModifierMode = typeof MODIFIER_MODES[number]["mode"];

export const PERK_CATEGORIES = [
  { name: "default", color: -1, label: "Default" },
  { name: "root", color: -1, label: "Root" },
  { name: "major", color: -22016, label: "Major" },
  { name: "epiphany", color: -22016, label: "Epiphany" },
] as const;

export type PerkCategory = typeof PERK_CATEGORIES[number]["name"];

export const CONSTELLATIONS = [
  { key: "astralsorcery:aevitas", field: "AEVITAS", color: "#6abf69" },
  { key: "astralsorcery:armara", field: "ARMARA", color: "#c7a14a" },
  { key: "astralsorcery:discidia", field: "DISCIDIA", color: "#c94b4b" },
  { key: "astralsorcery:evorsio", field: "EVORSIO", color: "#9a68c9" },
  { key: "astralsorcery:vicio", field: "VICIO", color: "#4a9dd3" },
] as const;

export type ConstellationKey = typeof CONSTELLATIONS[number]["key"];

export const CATEGORY_COLORS: Record<PerkCategory, string> = {
  default: "#cccccc",
  root: "#ffffff",
  major: "#ffd94a",
  epiphany: "#ffd94a",
};

export const GROUP_COLORS: Record<string, string> = {
  generic: "#7aa6da",
  root: "#ffffff",
  key: "#ff9f68",
};
