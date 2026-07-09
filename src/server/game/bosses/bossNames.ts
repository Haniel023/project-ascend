import { pickDeterministicIndex } from "@/server/game/shared/seededRandom";

const BOSS_NAME_POOL = [
  "The Iron Colossus",
  "Vein-Splitter",
  "The Endless Grind",
  "Warden of Fatigue",
  "The Plateau Wraith",
  "Doubt, the Whisperer",
  "The Soreness Titan",
  "Gravity's Champion",
  "The Burnout Beast",
  "Old Man Atrophy",
  "The Form-Breaker",
  "Excuses Incarnate",
];

// Deterministic per (user, week) so refreshing the page never rerolls the boss's name.
export function pickBossName(userId: string, weekStartDate: string): string {
  const index = pickDeterministicIndex(`${userId}:${weekStartDate}:name`, BOSS_NAME_POOL.length);
  return BOSS_NAME_POOL[index];
}
