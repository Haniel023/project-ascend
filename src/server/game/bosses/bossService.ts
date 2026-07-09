import { and, asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  exerciseMuscleGroups,
  muscleGroups,
  planDays,
  planExercises,
  profiles,
  weeklyBosses,
  workoutLogs,
  workoutPlans,
} from "@/server/db/schema";
import { getWeekStartDate } from "@/lib/dates";
import { levelForXp } from "@/server/game/xp/leveling";
import { rankForLevel } from "@/server/game/xp/ranks";
import { pickDeterministicIndex } from "@/server/game/shared/seededRandom";
import { pickBossName } from "./bossNames";
import { BOSS_DEFEAT_BONUS_XP, getRequiredSetsForRank } from "./bossScaling";
import { applyBossXp } from "@/server/game/xp/xpLedger";
import { getActiveEquipmentBonus } from "@/server/game/equipment/equipmentService";

export type WeeklyBoss = typeof weeklyBosses.$inferSelect;

// Generates this week's boss for a user on first visit, if they don't have one yet.
// Returns null if the user has no active plan, or their active plan has no day
// splits (day-splitting is what a boss targets -- see splitTemplate.ts/plan_day).
export async function ensureWeeklyBoss(userId: string, timezone: string): Promise<WeeklyBoss | null> {
  const weekStartDate = getWeekStartDate(timezone);

  const existing = await db.query.weeklyBosses.findFirst({
    where: and(eq(weeklyBosses.userId, userId), eq(weeklyBosses.weekStartDate, weekStartDate)),
  });
  if (existing) return existing;

  const activePlan = await db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.userId, userId), eq(workoutPlans.isActive, true)),
  });
  if (!activePlan) return null;

  const days = await db.query.planDays.findMany({
    where: eq(planDays.planId, activePlan.id),
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });
  if (days.length === 0) return null;

  const dayIndex = pickDeterministicIndex(`${userId}:${weekStartDate}:day`, days.length);
  const day = days[dayIndex];

  const muscleGroupRows = await db
    .selectDistinct({ slug: muscleGroups.slug })
    .from(planExercises)
    .innerJoin(
      exerciseMuscleGroups,
      and(eq(exerciseMuscleGroups.exerciseId, planExercises.exerciseId), eq(exerciseMuscleGroups.isPrimary, true))
    )
    .innerJoin(muscleGroups, eq(exerciseMuscleGroups.muscleGroupId, muscleGroups.id))
    .where(eq(planExercises.planDayId, day.id));
  const muscleGroupSlugs = muscleGroupRows.map((r) => r.slug);
  if (muscleGroupSlugs.length === 0) return null; // day has no exercises assigned yet

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  const rank = rankForLevel(levelForXp(profile?.totalXp ?? 0));

  const [boss] = await db
    .insert(weeklyBosses)
    .values({
      userId,
      planDayId: day.id,
      dayNameSnapshot: day.name,
      muscleGroupSlugsSnapshot: muscleGroupSlugs,
      title: pickBossName(userId, weekStartDate),
      weekStartDate,
      requiredSets: getRequiredSetsForRank(rank),
      currentProgress: 0,
    })
    .onConflictDoNothing({ target: [weeklyBosses.userId, weeklyBosses.weekStartDate] })
    .returning();

  if (boss) return boss;

  // Lost a race with a concurrent request generating the same week's boss.
  return (
    (await db.query.weeklyBosses.findFirst({
      where: and(eq(weeklyBosses.userId, userId), eq(weeklyBosses.weekStartDate, weekStartDate)),
    })) ?? null
  );
}

export type BossProgressResult = {
  boss: WeeklyBoss;
  setsAdded: number;
  justDefeated: boolean;
  bonusXpAwarded: number;
};

// Called after a workout's rows are committed (mirrors applyWorkoutXp's pattern of
// reading back what was just written rather than threading extra params through).
export async function applyBossProgress(params: {
  userId: string;
  workoutLogId: number;
  timezone: string;
}): Promise<BossProgressResult | null> {
  const { userId, workoutLogId, timezone } = params;
  const weekStartDate = getWeekStartDate(timezone);

  const boss = await db.query.weeklyBosses.findFirst({
    where: and(eq(weeklyBosses.userId, userId), eq(weeklyBosses.weekStartDate, weekStartDate)),
  });
  if (!boss || boss.isDefeated) return null;

  const log = await db.query.workoutLogs.findFirst({
    where: eq(workoutLogs.id, workoutLogId),
    with: { exercises: { with: { sets: true } } },
  });
  if (!log) return null;

  const allGroups = await db.query.muscleGroups.findMany();
  const slugById = new Map(allGroups.map((g) => [g.id, g.slug]));
  const focusSlugs = new Set(boss.muscleGroupSlugsSnapshot);

  let rawSetsAdded = 0;
  for (const exercise of log.exercises) {
    const slug = slugById.get(exercise.muscleGroupId);
    if (slug && focusSlugs.has(slug)) rawSetsAdded += exercise.sets.length;
  }
  if (rawSetsAdded === 0) return null;

  const bossDamageBonus = 1 + (await getActiveEquipmentBonus(userId, "boss_damage"));
  const setsAdded = Math.round(rawSetsAdded * bossDamageBonus);

  const newProgress = Math.min(boss.requiredSets, boss.currentProgress + setsAdded);
  const justDefeated = newProgress >= boss.requiredSets;
  let bonusXpAwarded = 0;
  let rewardXpTransactionId: number | null = null;

  if (justDefeated) {
    const xpResult = await applyBossXp({
      userId,
      logDate: log.logDate,
      bonusXp: BOSS_DEFEAT_BONUS_XP,
      bossId: boss.id,
    });
    bonusXpAwarded = xpResult.xpAwarded;
    rewardXpTransactionId = xpResult.xpTransactionIds[0] ?? null;
  }

  await db
    .update(weeklyBosses)
    .set({
      currentProgress: newProgress,
      isDefeated: justDefeated,
      defeatedAt: justDefeated ? new Date() : null,
      rewardXpTransactionId,
    })
    .where(eq(weeklyBosses.id, boss.id));

  return {
    boss: { ...boss, currentProgress: newProgress, isDefeated: justDefeated },
    setsAdded,
    justDefeated,
    bonusXpAwarded,
  };
}
