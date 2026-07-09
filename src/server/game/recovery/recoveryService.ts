import { and, avg, desc, eq, gte } from "drizzle-orm";
import { db } from "@/server/db/client";
import { profiles, recoveryCheckins, workoutLogSets, workoutLogExercises, workoutLogs } from "@/server/db/schema";
import { format, subDays } from "date-fns";
import { computeRecoveryScore } from "./recoveryScore";
import { recoveryXpMultiplier } from "./recoveryXpMultiplier";

export type RecoveryCheckinInput = {
  userId: string;
  checkinDate: string;
  sleepHours: number;
  waterIntakeLiters: number;
  energyLevel: number;
  sorenessLevel: number;
  stressLevel: number;
  moodLevel: number;
};

// Average RPE across the trailing 3 days of logged sets that recorded one -- a short
// window so it reflects recent training stress, not a stale average from weeks ago.
async function getRecentAvgRpe(userId: string, checkinDate: string): Promise<number | null> {
  const windowStart = format(subDays(new Date(checkinDate), 3), "yyyy-MM-dd");
  const [row] = await db
    .select({ avgRpe: avg(workoutLogSets.rpe) })
    .from(workoutLogSets)
    .innerJoin(workoutLogExercises, eq(workoutLogSets.workoutLogExerciseId, workoutLogExercises.id))
    .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
    .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.logDate, windowStart)));
  return row?.avgRpe != null ? Number(row.avgRpe) : null;
}

// Upserts on (userId, checkinDate) -- a second same-day check-in updates rather than
// rejects, so users can correct an entry instead of being stuck with a bad first pass.
export async function submitRecoveryCheckin(input: RecoveryCheckinInput) {
  const { userId, checkinDate, ...levels } = input;

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  const avgRpe = await getRecentAvgRpe(userId, checkinDate);

  const { score, breakdown } = computeRecoveryScore({
    ...levels,
    avgRpe,
    currentStreak: profile?.currentStreak ?? 0,
  });

  const [checkin] = await db
    .insert(recoveryCheckins)
    .values({ userId, checkinDate, ...levels, recoveryScore: score, scoreBreakdown: breakdown })
    .onConflictDoUpdate({
      target: [recoveryCheckins.userId, recoveryCheckins.checkinDate],
      set: { ...levels, recoveryScore: score, scoreBreakdown: breakdown, updatedAt: new Date() },
    })
    .returning();

  return checkin;
}

export async function getTodayRecoveryCheckin(userId: string, checkinDate: string) {
  return db.query.recoveryCheckins.findFirst({
    where: and(eq(recoveryCheckins.userId, userId), eq(recoveryCheckins.checkinDate, checkinDate)),
  });
}

// Defaults to a neutral 1.0x when no check-in exists for the day -- recovery never
// blocks or degrades XP by its absence, only by an explicitly logged bad day.
export async function getRecoveryMultiplierForDate(userId: string, logDate: string): Promise<number> {
  const checkin = await getTodayRecoveryCheckin(userId, logDate);
  if (!checkin) return 1.0;
  return recoveryXpMultiplier(checkin.recoveryScore);
}

export async function getRecoveryHistory(userId: string, sinceDate: string) {
  return db.query.recoveryCheckins.findMany({
    where: and(eq(recoveryCheckins.userId, userId), gte(recoveryCheckins.checkinDate, sinceDate)),
    orderBy: desc(recoveryCheckins.checkinDate),
  });
}
