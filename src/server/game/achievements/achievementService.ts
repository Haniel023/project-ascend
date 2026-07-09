import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  achievements,
  profiles,
  userAchievements,
  weeklyBosses,
  workoutLogExercises,
  workoutLogs,
} from "@/server/db/schema";
import { getWeekStartDateFromDateString } from "@/lib/dates";
import { levelForXp } from "@/server/game/xp/leveling";
import {
  isAchievementUnlocked,
  type AchievementCriteria,
  type AchievementStats,
} from "./achievementDefinitions";

async function computeStats(userId: string): Promise<AchievementStats> {
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });

  const [{ totalWorkouts }] = await db
    .select({ totalWorkouts: sql<number>`count(*)` })
    .from(workoutLogs)
    .where(eq(workoutLogs.userId, userId));

  const [{ bossDefeats }] = await db
    .select({ bossDefeats: sql<number>`count(*)` })
    .from(weeklyBosses)
    .where(eq(weeklyBosses.userId, userId));

  const rows = await db
    .select({ logDate: workoutLogs.logDate, muscleGroupId: workoutLogExercises.muscleGroupId })
    .from(workoutLogExercises)
    .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
    .where(eq(workoutLogs.userId, userId));

  const groupsByWeek = new Map<string, Set<number>>();
  for (const row of rows) {
    const week = getWeekStartDateFromDateString(row.logDate);
    if (!groupsByWeek.has(week)) groupsByWeek.set(week, new Set());
    groupsByWeek.get(week)!.add(row.muscleGroupId);
  }
  const maxWeeklyMuscleGroupCoverage = Math.max(0, ...[...groupsByWeek.values()].map((s) => s.size));

  return {
    longestStreak: profile?.longestStreak ?? 0,
    level: levelForXp(profile?.totalXp ?? 0),
    totalWorkouts: Number(totalWorkouts),
    bossDefeats: Number(bossDefeats),
    maxWeeklyMuscleGroupCoverage,
  };
}

export type UnlockedAchievement = { slug: string; title: string; description: string; iconKey: string };

// Re-evaluates every achievement the user hasn't unlocked yet against their current
// stats and unlocks any that now qualify. Cheap enough to call after any XP-granting
// event (workout logged, quest completed, boss defeated) -- no separate cron needed.
export async function checkAndUnlockAchievements(userId: string): Promise<UnlockedAchievement[]> {
  const allAchievements = await db.query.achievements.findMany();
  const alreadyUnlocked = await db.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
    columns: { achievementId: true },
  });
  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.achievementId));

  const locked = allAchievements.filter((a) => !unlockedIds.has(a.id));
  if (locked.length === 0) return [];

  const stats = await computeStats(userId);
  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of locked) {
    const criteria = achievement.criteriaJson as AchievementCriteria | null;
    if (!criteria) continue;
    if (isAchievementUnlocked(criteria, stats)) {
      await db
        .insert(userAchievements)
        .values({ userId, achievementId: achievement.id })
        .onConflictDoNothing({ target: [userAchievements.userId, userAchievements.achievementId] });
      newlyUnlocked.push({
        slug: achievement.slug,
        title: achievement.title,
        description: achievement.description,
        iconKey: achievement.iconKey,
      });
    }
  }

  return newlyUnlocked;
}
