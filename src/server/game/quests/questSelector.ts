import { pickDeterministicIndices } from "@/server/game/shared/seededRandom";

// Deterministic per-user, per-day quest selection: the same (userId, date) pair always
// produces the same picks, so generation is idempotent/reproducible without needing to
// store anything until the moment we actually persist the chosen instances.
export function selectDailyQuestIndices(userId: string, dateISO: string, poolSize: number, count: number): number[] {
  return pickDeterministicIndices(`${userId}:${dateISO}`, poolSize, count);
}
