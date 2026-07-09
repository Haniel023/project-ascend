import { and, eq, gte, lte, ne, sql } from "drizzle-orm";
import { format, parseISO, subDays } from "date-fns";
import { db } from "@/server/db/client";
import {
  profiles,
  workoutLogExercises,
  workoutLogSets,
  workoutLogs,
  xpTransactions,
} from "@/server/db/schema";
import type { Rank, XpSourceType } from "@/server/db/schema/enums";
import { coverageMultiplier, diminishingMultiplier, rawSetXp, DAILY_XP_CAP } from "./xpFormulas";
import { levelForXp } from "./leveling";
import { rankForLevel } from "./ranks";
import { computeStreakUpdate } from "@/server/game/streak/streakService";
import { getRecoveryMultiplierForDate } from "@/server/game/recovery/recoveryService";
import { getActiveEquipmentBonus } from "@/server/game/equipment/equipmentService";

export type XpGrantResult = {
  xpAwarded: number;
  totalXp: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  fromRank: Rank;
  toRank: Rank;
  rankChanged: boolean;
  xpTransactionIds: number[];
};

type XpTransactionInsert = {
  sourceType: XpSourceType;
  sourceId: number | null;
  rawXp: number;
  diminishingMultiplier: number;
  coverageMultiplier: number;
  recoveryMultiplier: number;
  equipmentMultiplier: number;
  finalXp: number;
  muscleGroupsInvolved: string[] | null;
};

// Shared finalization: writes the xp_transactions rows, updates cached totalXp/level,
// and rolls the streak forward. Used by both workout and quest XP grants so leveling/
// streak semantics can never drift between the two sources.
async function finalizeXpGrant(params: {
  userId: string;
  logDate: string;
  oldTotalXp: number;
  oldStreak: { currentStreak: number; longestStreak: number; lastActivityDate: string | null };
  transactions: XpTransactionInsert[];
}): Promise<XpGrantResult> {
  const { userId, logDate, oldTotalXp, oldStreak, transactions } = params;
  const oldLevel = levelForXp(oldTotalXp);
  const xpAwarded = transactions.reduce((sum, t) => sum + t.finalXp, 0);
  const newTotalXp = oldTotalXp + xpAwarded;
  const newLevel = levelForXp(newTotalXp);
  const xpTransactionIds: number[] = [];

  await db.transaction(async (tx) => {
    for (const t of transactions) {
      const [inserted] = await tx
        .insert(xpTransactions)
        .values({ userId, logDate, ...t })
        .returning({ id: xpTransactions.id });
      xpTransactionIds.push(inserted.id);
    }

    const streak = computeStreakUpdate(oldStreak, logDate);
    await tx
      .update(profiles)
      .set({
        totalXp: newTotalXp,
        currentLevel: newLevel,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActivityDate: streak.lastActivityDate,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId));
  });

  const fromRank = rankForLevel(oldLevel);
  const toRank = rankForLevel(newLevel);

  return {
    xpAwarded,
    totalXp: newTotalXp,
    oldLevel,
    newLevel,
    leveledUp: newLevel > oldLevel,
    fromRank,
    toRank,
    rankChanged: toRank !== fromRank,
    xpTransactionIds,
  };
}

async function getExistingTodayXp(userId: string, logDate: string): Promise<number> {
  const row = await db
    .select({ total: sql<number>`coalesce(sum(${xpTransactions.finalXp}), 0)` })
    .from(xpTransactions)
    .where(and(eq(xpTransactions.userId, userId), eq(xpTransactions.logDate, logDate)));
  return Number(row[0]?.total ?? 0);
}

// Called once, right after a workout's log/exercises/sets rows are committed. Reads
// the just-inserted rows back from the DB rather than taking them as params, so the
// trailing-7-day coverage window naturally includes what was just logged.
export async function applyWorkoutXp(params: {
  userId: string;
  workoutLogId: number;
}): Promise<XpGrantResult> {
  const { userId, workoutLogId } = params;

  const log = await db.query.workoutLogs.findFirst({
    where: eq(workoutLogs.id, workoutLogId),
    with: { exercises: { with: { sets: true } } },
  });
  if (!log) throw new Error("Workout log not found.");
  const logDate = log.logDate;

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  if (!profile) throw new Error("Profile not found.");

  // Distinct muscle groups trained in the trailing 7 days, inclusive of today --
  // this log's rows are already committed, so today's groups are naturally included.
  const windowStart = format(subDays(parseISO(logDate), 6), "yyyy-MM-dd");
  const coverageRows = await db
    .selectDistinct({ muscleGroupId: workoutLogExercises.muscleGroupId })
    .from(workoutLogExercises)
    .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
    .where(
      and(eq(workoutLogs.userId, userId), gte(workoutLogs.logDate, windowStart), lte(workoutLogs.logDate, logDate))
    );
  const coverage = coverageMultiplier(coverageRows.length);
  const recovery = await getRecoveryMultiplierForDate(userId, logDate);
  const equipment = 1 + (await getActiveEquipmentBonus(userId, "workout_xp"));

  // Sets logged earlier TODAY (in a different workout_log), per muscle group, so
  // diminishing returns stack correctly across multiple logging sessions in one day.
  const priorTodayCounts = await db
    .select({ muscleGroupId: workoutLogExercises.muscleGroupId, count: sql<number>`count(*)` })
    .from(workoutLogSets)
    .innerJoin(workoutLogExercises, eq(workoutLogSets.workoutLogExerciseId, workoutLogExercises.id))
    .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
    .where(and(eq(workoutLogs.userId, userId), eq(workoutLogs.logDate, logDate), ne(workoutLogs.id, workoutLogId)))
    .groupBy(workoutLogExercises.muscleGroupId);
  const runningCountByMuscleGroup = new Map(priorTodayCounts.map((r) => [r.muscleGroupId, Number(r.count)]));

  const existingTodayXp = await getExistingTodayXp(userId, logDate);

  type PendingRow = { workoutLogSetId: number; muscleGroupId: number; raw: number; diminishing: number; preCap: number };
  const pending: PendingRow[] = [];

  for (const exercise of log.exercises) {
    for (const set of exercise.sets) {
      const nextCount = (runningCountByMuscleGroup.get(exercise.muscleGroupId) ?? 0) + 1;
      runningCountByMuscleGroup.set(exercise.muscleGroupId, nextCount);

      const raw = rawSetXp({
        trackingType: inferTrackingType(set),
        reps: set.reps,
        weightKg: set.weightKg,
        durationSeconds: set.durationSeconds,
        distanceMeters: set.distanceMeters,
      });
      const diminishing = diminishingMultiplier(nextCount);
      pending.push({
        workoutLogSetId: set.id,
        muscleGroupId: exercise.muscleGroupId,
        raw,
        diminishing,
        preCap: Math.round(raw * diminishing * coverage * recovery * equipment),
      });
    }
  }

  const sumPreCap = pending.reduce((sum, p) => sum + p.preCap, 0);
  const allowedNew = Math.max(0, DAILY_XP_CAP - existingTodayXp);
  const scale = sumPreCap > 0 ? Math.min(1, allowedNew / sumPreCap) : 1;

  const transactions: XpTransactionInsert[] = pending.map((p) => ({
    sourceType: "workout_set_group",
    sourceId: p.workoutLogSetId,
    rawXp: p.raw,
    diminishingMultiplier: p.diminishing,
    coverageMultiplier: coverage,
    recoveryMultiplier: recovery,
    equipmentMultiplier: equipment,
    finalXp: Math.round(p.preCap * scale),
    muscleGroupsInvolved: [String(p.muscleGroupId)],
  }));

  return finalizeXpGrant({
    userId,
    logDate,
    oldTotalXp: profile.totalXp,
    oldStreak: {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lastActivityDate: profile.lastActivityDate,
    },
    transactions,
  });
}

// Daily quest completion: a flat bonus, deliberately exempt from the diminishing-
// returns and coverage multipliers (recovery-oriented work shouldn't be gated by --
// or count toward -- muscle-group balance). Still subject to the shared daily cap
// and still advances the streak, since it's genuine daily engagement.
export async function applyQuestXp(params: {
  userId: string;
  logDate: string;
  bonusXp: number;
  questInstanceId: number;
}): Promise<XpGrantResult> {
  const { userId, logDate, bonusXp, questInstanceId } = params;

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  if (!profile) throw new Error("Profile not found.");

  const existingTodayXp = await getExistingTodayXp(userId, logDate);
  const allowedNew = Math.max(0, DAILY_XP_CAP - existingTodayXp);
  const equipment = 1 + (await getActiveEquipmentBonus(userId, "quest_xp"));
  const finalXp = Math.min(Math.round(bonusXp * equipment), allowedNew);

  return finalizeXpGrant({
    userId,
    logDate,
    oldTotalXp: profile.totalXp,
    oldStreak: {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lastActivityDate: profile.lastActivityDate,
    },
    transactions: [
      {
        sourceType: "daily_quest",
        sourceId: questInstanceId,
        rawXp: bonusXp,
        diminishingMultiplier: 1,
        coverageMultiplier: 1,
        recoveryMultiplier: 1,
        equipmentMultiplier: equipment,
        finalXp,
        muscleGroupsInvolved: null,
      },
    ],
  });
}

// Weekly boss defeat: a significant, rare, rank-gated one-time bonus -- deliberately
// exempt from the daily cap (unlike workout/quest XP) since it can't be farmed.
export async function applyBossXp(params: {
  userId: string;
  logDate: string;
  bonusXp: number;
  bossId: number;
}): Promise<XpGrantResult> {
  const { userId, logDate, bonusXp, bossId } = params;

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  if (!profile) throw new Error("Profile not found.");

  return finalizeXpGrant({
    userId,
    logDate,
    oldTotalXp: profile.totalXp,
    oldStreak: {
      currentStreak: profile.currentStreak,
      longestStreak: profile.longestStreak,
      lastActivityDate: profile.lastActivityDate,
    },
    transactions: [
      {
        sourceType: "boss_defeat",
        sourceId: bossId,
        rawXp: bonusXp,
        diminishingMultiplier: 1,
        coverageMultiplier: 1,
        recoveryMultiplier: 1,
        equipmentMultiplier: 1,
        finalXp: bonusXp,
        muscleGroupsInvolved: null,
      },
    ],
  });
}

function inferTrackingType(set: {
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
}): "reps_weight" | "reps_only" | "duration" | "distance" {
  if (set.durationSeconds != null) return "duration";
  if (set.distanceMeters != null) return "distance";
  if (set.reps != null && set.weightKg != null) return "reps_weight";
  return "reps_only";
}
