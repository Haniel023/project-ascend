import { and, eq, gte, sql } from "drizzle-orm";
import { format, subDays } from "date-fns";
import { db } from "@/server/db/client";
import {
  dungeonRuns,
  exerciseMuscleGroups,
  planDays,
  planExercises,
  profiles,
  weeklyBosses,
  workoutLogExercises,
  workoutLogs,
  workoutPlans,
} from "@/server/db/schema";
import { getWeekStartDate } from "@/lib/dates";
import { levelForXp } from "@/server/game/xp/leveling";
import { rankForLevel } from "@/server/game/xp/ranks";
import { getRecoveryMultiplierForDate } from "@/server/game/recovery/recoveryService";
import { ensureDailyQuests } from "@/server/game/quests/questService";
import { pickDungeonFlavor } from "./dungeonNames";
import { estimateDungeonXp, pickNextPlanDay } from "./dungeonGenerator";

export type DungeonRun = typeof dungeonRuns.$inferSelect;

// Generates today's dungeon on first visit, if the user has an active, day-split plan.
// Returns null if there's no active plan, the plan has no days, or the rotated-to day
// has no exercises assigned yet -- callers should fall back to the plain /log flow.
export async function ensureTodayDungeon(userId: string, timezone: string, today: string): Promise<DungeonRun | null> {
  const existing = await db.query.dungeonRuns.findFirst({
    where: and(eq(dungeonRuns.userId, userId), eq(dungeonRuns.runDate, today)),
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

  const windowStart = format(subDays(new Date(today), 6), "yyyy-MM-dd");
  const recentRows = await db
    .select({ planDayId: planExercises.planDayId, sets: sql<number>`count(*)` })
    .from(workoutLogExercises)
    .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
    .innerJoin(planExercises, eq(workoutLogExercises.planExerciseId, planExercises.id))
    .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.logDate, windowStart)))
    .groupBy(planExercises.planDayId);
  const recentSetCounts = new Map(
    recentRows.filter((r) => r.planDayId != null).map((r) => [r.planDayId as number, Number(r.sets)])
  );

  const dayId = pickNextPlanDay(
    days.map((d) => ({ id: d.id, sortOrder: d.sortOrder })),
    recentSetCounts
  );
  const day = days.find((d) => d.id === dayId)!;

  const dayExercises = await db
    .select({
      targetSets: planExercises.targetSets,
      targetRepsMin: planExercises.targetRepsMin,
      targetRepsMax: planExercises.targetRepsMax,
      targetWeightKg: planExercises.targetWeightKg,
    })
    .from(planExercises)
    .where(eq(planExercises.planDayId, day.id));
  if (dayExercises.length === 0) return null;

  const muscleGroupRows = await db
    .selectDistinct({ muscleGroupId: exerciseMuscleGroups.muscleGroupId })
    .from(planExercises)
    .innerJoin(
      exerciseMuscleGroups,
      and(eq(exerciseMuscleGroups.exerciseId, planExercises.exerciseId), eq(exerciseMuscleGroups.isPrimary, true))
    )
    .where(eq(planExercises.planDayId, day.id));

  const recoveryMultiplier = await getRecoveryMultiplierForDate(userId, today);
  const estimatedXp = estimateDungeonXp(dayExercises, muscleGroupRows.length, recoveryMultiplier);

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  const difficulty = rankForLevel(levelForXp(profile?.totalXp ?? 0));

  const weekStartDate = getWeekStartDate(timezone);
  const boss = await db.query.weeklyBosses.findFirst({
    where: and(eq(weeklyBosses.userId, userId), eq(weeklyBosses.weekStartDate, weekStartDate)),
  });
  const includesBossEncounter = boss != null && !boss.isDefeated && boss.planDayId === day.id;

  const flavor = pickDungeonFlavor(userId, today);
  const questInstances = await ensureDailyQuests(userId, today);
  const questInstanceId = questInstances[0]?.id ?? null;

  const [created] = await db
    .insert(dungeonRuns)
    .values({
      userId,
      runDate: today,
      planId: activePlan.id,
      planDayId: day.id,
      dayNameSnapshot: day.name,
      title: flavor.title,
      storyText: flavor.story,
      difficulty,
      estimatedXp,
      includesBossEncounter,
      questInstanceId,
    })
    .onConflictDoNothing({ target: [dungeonRuns.userId, dungeonRuns.runDate] })
    .returning();

  if (created) return created;

  // Lost a race with a concurrent request generating the same day's dungeon.
  return (
    (await db.query.dungeonRuns.findFirst({
      where: and(eq(dungeonRuns.userId, userId), eq(dungeonRuns.runDate, today)),
    })) ?? null
  );
}

// Called after a workout's rows are committed and XP applied (mirrors applyBossProgress's
// pattern of reading back the already-committed workoutLogId). Never grants XP itself --
// the wrapped workout log already did that through the normal pipeline.
export async function completeDungeonRun(userId: string, dungeonRunId: number, workoutLogId: number): Promise<void> {
  const dungeon = await db.query.dungeonRuns.findFirst({
    where: and(eq(dungeonRuns.id, dungeonRunId), eq(dungeonRuns.userId, userId)),
  });
  if (!dungeon || dungeon.isCompleted) return;

  await db
    .update(dungeonRuns)
    .set({ isCompleted: true, completedAt: new Date(), workoutLogId })
    .where(eq(dungeonRuns.id, dungeonRunId));
}
