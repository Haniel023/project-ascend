"use server";

import { and, eq, inArray, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import {
  exerciseMuscleGroups,
  exercises,
  planExercises,
  profiles,
  workoutLogExercises,
  workoutLogSets,
  workoutLogs,
} from "@/server/db/schema";
import { getLocalDateString } from "@/lib/dates";
import { logWorkoutSchema } from "@/server/validation/workoutLog.validation";
import { applyWorkoutXp } from "@/server/game/xp/xpLedger";
import { generateOverloadSuggestions } from "@/server/game/overload/overloadService";
import { applyBossProgress, ensureWeeklyBoss } from "@/server/game/bosses/bossService";
import { checkAndUnlockAchievements } from "@/server/game/achievements/achievementService";
import { checkAndRecordPersonalRecords } from "@/server/game/records/recordsService";
import { completeDungeonRun } from "@/server/game/dungeons/dungeonService";
import { grantLoot, type GrantedLoot } from "@/server/game/equipment/equipmentService";

type ActionResult = { error?: string; success?: true };

export async function logWorkoutAction(input: unknown): Promise<ActionResult> {
  const { userId } = await verifySession();

  const parsed = logWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const exerciseIds = [...new Set(data.exercises.map((e) => e.exerciseId))];

  // Ownership/visibility check: every referenced exercise must be a system-seeded
  // exercise or one this user created themselves.
  const validExercises = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(
      and(
        inArray(exercises.id, exerciseIds),
        or(eq(exercises.isSeeded, true), eq(exercises.createdByUserId, userId))
      )
    );
  if (validExercises.length !== exerciseIds.length) {
    return { error: "One or more exercises could not be found." };
  }

  const planExerciseIds = data.exercises
    .map((e) => e.planExerciseId)
    .filter((id): id is number => id != null);

  // Verify plan-exercise ownership via the owning plan.
  if (planExerciseIds.length > 0) {
    const owned = await db.query.planExercises.findMany({
      where: inArray(planExercises.id, planExerciseIds),
      with: { plan: { columns: { userId: true } } },
    });
    const allOwned =
      owned.length === planExerciseIds.length && owned.every((pe) => pe.plan.userId === userId);
    if (!allOwned) {
      return { error: "One or more plan exercises could not be found." };
    }
  }

  const muscleGroupRows = await db
    .select({ exerciseId: exerciseMuscleGroups.exerciseId, muscleGroupId: exerciseMuscleGroups.muscleGroupId })
    .from(exerciseMuscleGroups)
    .where(and(inArray(exerciseMuscleGroups.exerciseId, exerciseIds), eq(exerciseMuscleGroups.isPrimary, true)));
  const muscleGroupByExerciseId = new Map(muscleGroupRows.map((r) => [r.exerciseId, r.muscleGroupId]));

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  const timezone = profile?.timezone ?? "UTC";
  const now = new Date();
  const logDate = getLocalDateString(timezone, now);

  const workoutLogId = await db.transaction(async (tx) => {
    const [log] = await tx
      .insert(workoutLogs)
      .values({ userId, planId: data.planId, performedAt: now, logDate })
      .returning({ id: workoutLogs.id });

    for (let i = 0; i < data.exercises.length; i++) {
      const entry = data.exercises[i];
      const muscleGroupId = muscleGroupByExerciseId.get(entry.exerciseId);
      if (!muscleGroupId) continue; // exercise with no tagged muscle group -- shouldn't happen for valid data

      const [logExercise] = await tx
        .insert(workoutLogExercises)
        .values({
          workoutLogId: log.id,
          exerciseId: entry.exerciseId,
          planExerciseId: entry.planExerciseId,
          muscleGroupId,
          sortOrder: i,
        })
        .returning({ id: workoutLogExercises.id });

      await tx.insert(workoutLogSets).values(
        entry.sets.map((set, setIndex) => ({
          workoutLogExerciseId: logExercise.id,
          setNumber: setIndex + 1,
          reps: set.reps,
          weightKg: set.weightKg,
          durationSeconds: set.durationSeconds,
          distanceMeters: set.distanceMeters,
          rpe: set.rpe,
        }))
      );
    }

    return log.id;
  });

  const xpResult = await applyWorkoutXp({ userId, workoutLogId });

  const params = new URLSearchParams({
    xp: String(xpResult.xpAwarded),
    leveledUp: String(xpResult.leveledUp),
  });

  if (xpResult.rankChanged) {
    const eventId = await generateOverloadSuggestions({
      userId,
      fromLevel: xpResult.oldLevel,
      toLevel: xpResult.newLevel,
      fromRank: xpResult.fromRank,
      toRank: xpResult.toRank,
    });
    params.set("rankUp", xpResult.toRank);
    if (eventId) params.set("overloadEventId", String(eventId));
  }

  const loot: GrantedLoot[] = [];

  // Make sure this week's boss exists before applying progress, so sets logged
  // before the player ever opens a boss-showing page still count.
  await ensureWeeklyBoss(userId, timezone);
  const bossResult = await applyBossProgress({ userId, workoutLogId, timezone });
  if (bossResult?.justDefeated) {
    params.set("bossDefeated", bossResult.boss.title);
    if (bossResult.bonusXpAwarded > 0) {
      params.set("bossBonusXp", String(bossResult.bonusXpAwarded));
    }
    const bossLoot = await grantLoot(userId, "boss", `${userId}:boss:${bossResult.boss.id}`);
    if (bossLoot) loot.push(bossLoot);
  }

  const unlocked = await checkAndUnlockAchievements(userId);
  if (unlocked.length > 0) {
    params.set("achievementsUnlocked", unlocked.map((a) => a.title).join(","));
    for (const achievement of unlocked) {
      const achievementLoot = await grantLoot(userId, "achievement", `${userId}:achievement:${achievement.slug}`);
      if (achievementLoot) loot.push(achievementLoot);
    }
  }

  const newPRs = await checkAndRecordPersonalRecords(userId, workoutLogId);
  if (newPRs.length > 0) {
    params.set("newPRs", newPRs.map((p) => p.exerciseName).join(","));
  }

  if (data.dungeonRunId) {
    await completeDungeonRun(userId, data.dungeonRunId, workoutLogId);
    params.set("dungeonCleared", "1");
    const dungeonLoot = await grantLoot(userId, "dungeon", `${userId}:dungeon:${data.dungeonRunId}`);
    if (dungeonLoot) loot.push(dungeonLoot);
  }

  if (loot.length > 0) {
    params.set("lootDropped", loot.map((l) => l.name).join(","));
    params.set("lootRarity", loot.map((l) => l.rarity).join(","));
  }

  redirect(`/dashboard?${params.toString()}`);
}
