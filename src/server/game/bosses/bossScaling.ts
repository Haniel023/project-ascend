import type { Rank } from "@/server/db/schema/enums";

// Total sets (across the boss's focused muscle groups) required to defeat that
// week's boss. Scales with rank so the fight stays meaningful as a plan gets harder
// through progressive overload.
const REQUIRED_SETS_BY_RANK: Record<Rank, number> = {
  novice: 20,
  adept: 28,
  warrior: 35,
  champion: 42,
  legend: 50,
};

export function getRequiredSetsForRank(rank: Rank): number {
  return REQUIRED_SETS_BY_RANK[rank];
}

// Flat one-time bonus granted the moment a boss is defeated, on top of whatever XP
// the sets themselves already earned through the normal workout ledger.
export const BOSS_DEFEAT_BONUS_XP = 150;
