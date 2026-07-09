// Centralized enum-like unions. Stored as plain `text` columns (not native SQLite/Postgres
// enums) so the schema stays portable across the eventual SQLite -> Postgres migration.

export const EQUIPMENT_TYPES = [
  "barbell",
  "dumbbell",
  "machine",
  "bodyweight",
  "cable",
  "band",
  "other",
] as const;
export type Equipment = (typeof EQUIPMENT_TYPES)[number];

export const TRACKING_TYPES = [
  "reps_weight",
  "reps_only",
  "duration",
  "distance",
] as const;
export type TrackingType = (typeof TRACKING_TYPES)[number];

export const STARTING_FITNESS_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;
export type StartingFitnessLevel = (typeof STARTING_FITNESS_LEVELS)[number];

export const PRIMARY_GOALS = [
  "strength",
  "hypertrophy",
  "endurance",
  "fat_loss",
  "general_fitness",
] as const;
export type PrimaryGoal = (typeof PRIMARY_GOALS)[number];

export const XP_SOURCE_TYPES = [
  "workout_set_group",
  "daily_quest",
  "streak_bonus",
  "boss_defeat",
  "manual_adjustment",
] as const;
export type XpSourceType = (typeof XP_SOURCE_TYPES)[number];

export const QUEST_CATEGORIES = [
  "stretch",
  "mobility",
  "cooldown",
  "breathing",
  "hydration",
  "sleep",
  "other",
] as const;
export type QuestCategory = (typeof QUEST_CATEGORIES)[number];

export const QUEST_INSTANCE_STATUSES = ["pending", "completed", "expired"] as const;
export type QuestInstanceStatus = (typeof QUEST_INSTANCE_STATUSES)[number];

export const RANKS = ["novice", "adept", "warrior", "champion", "legend"] as const;
export type Rank = (typeof RANKS)[number];

export const EQUIPMENT_SLOTS = ["weapon", "head", "chest", "legs", "feet", "trinket"] as const;
export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export const EQUIPMENT_RARITIES = ["common", "uncommon", "rare", "epic", "mythic"] as const;
export type EquipmentRarity = (typeof EQUIPMENT_RARITIES)[number];

export const EQUIPMENT_BONUS_CATEGORIES = [
  "workout_xp",
  "quest_xp",
  "boss_damage",
  "recovery_score",
] as const;
export type EquipmentBonusCategory = (typeof EQUIPMENT_BONUS_CATEGORIES)[number];

export const EQUIPMENT_SOURCES = ["dungeon", "boss", "achievement"] as const;
export type EquipmentSource = (typeof EQUIPMENT_SOURCES)[number];
