import type { EquipmentRarity } from "@/server/db/schema/enums";
import { pickWeightedIndex } from "@/server/game/shared/seededRandom";

// From the uploaded equipment-design docs -- all three agreed on this table.
export const RARITY_ODDS: [rarity: EquipmentRarity, weight: number][] = [
  ["common", 45],
  ["uncommon", 35],
  ["rare", 15],
  ["epic", 4],
  ["mythic", 1],
];

// Deterministic per drop-event key so re-rendering a page never rerolls a grant.
export function rollRarity(key: string): EquipmentRarity {
  const index = pickWeightedIndex(
    key,
    RARITY_ODDS.map(([, weight]) => weight)
  );
  return RARITY_ODDS[index][0];
}

// Dungeon completions don't guarantee loot -- gated by a separate deterministic roll
// keyed off the same drop event (suffixed so it doesn't correlate with the rarity roll).
export const DUNGEON_DROP_CHANCE = 0.4;

export function rollDungeonDropChance(key: string): boolean {
  const index = pickWeightedIndex(`${key}:chance`, [DUNGEON_DROP_CHANCE, 1 - DUNGEON_DROP_CHANCE]);
  return index === 0;
}
