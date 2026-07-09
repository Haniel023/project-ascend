import { and, eq, gte, sql } from "drizzle-orm";
import { format, parseISO, subDays } from "date-fns";
import { db } from "@/server/db/client";
import { muscleGroups, workoutLogExercises, workoutLogSets, workoutLogs, xpTransactions } from "@/server/db/schema";
import type { MuscleBalancePoint } from "@/components/rpg/MuscleBalanceRadar";
import type { XpHistoryPoint } from "@/components/rpg/XpHistoryChart";
import type { FrequencyPoint } from "@/components/rpg/WorkoutFrequencyChart";

export function dateRange(days: number, today: string): string[] {
  const end = parseISO(today);
  return Array.from({ length: days }, (_, i) => format(subDays(end, days - 1 - i), "yyyy-MM-dd"));
}

export async function getMuscleBalance(userId: string, today: string, days: number): Promise<MuscleBalancePoint[]> {
  const windowStart = format(subDays(parseISO(today), days - 1), "yyyy-MM-dd");

  const rows = await db
    .select({ muscleGroup: muscleGroups.label, sortOrder: muscleGroups.sortOrder, sets: sql<number>`count(*)` })
    .from(workoutLogSets)
    .innerJoin(workoutLogExercises, eq(workoutLogSets.workoutLogExerciseId, workoutLogExercises.id))
    .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
    .innerJoin(muscleGroups, eq(workoutLogExercises.muscleGroupId, muscleGroups.id))
    .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.logDate, windowStart)))
    .groupBy(muscleGroups.id)
    .orderBy(muscleGroups.sortOrder);
  const countByGroup = new Map(rows.map((r) => [r.muscleGroup, Number(r.sets)]));

  const allGroups = await db.query.muscleGroups.findMany({ orderBy: (t, { asc }) => [asc(t.sortOrder)] });
  return allGroups.map((g) => ({ muscleGroup: g.label, sets: countByGroup.get(g.label) ?? 0 }));
}

export async function getXpHistory(userId: string, today: string, days: number): Promise<XpHistoryPoint[]> {
  const windowStart = format(subDays(parseISO(today), days - 1), "yyyy-MM-dd");

  const rows = await db
    .select({ logDate: xpTransactions.logDate, xp: sql<number>`sum(${xpTransactions.finalXp})` })
    .from(xpTransactions)
    .where(and(eq(xpTransactions.userId, userId), gte(xpTransactions.logDate, windowStart)))
    .groupBy(xpTransactions.logDate);
  const xpByDate = new Map(rows.map((r) => [r.logDate, Number(r.xp)]));

  return dateRange(days, today).map((date) => ({ date, xp: xpByDate.get(date) ?? 0 }));
}

export async function hasLoggedOnDate(userId: string, date: string): Promise<boolean> {
  const [row] = await db
    .select({ id: workoutLogs.id })
    .from(workoutLogs)
    .where(and(eq(workoutLogs.userId, userId), eq(workoutLogs.logDate, date)))
    .limit(1);
  return row != null;
}

export async function getWorkoutFrequency(userId: string, today: string, days: number): Promise<FrequencyPoint[]> {
  const windowStart = format(subDays(parseISO(today), days - 1), "yyyy-MM-dd");

  const rows = await db
    .select({ logDate: workoutLogs.logDate, sets: sql<number>`count(*)` })
    .from(workoutLogSets)
    .innerJoin(workoutLogExercises, eq(workoutLogSets.workoutLogExerciseId, workoutLogExercises.id))
    .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
    .where(and(eq(workoutLogs.userId, userId), gte(workoutLogs.logDate, windowStart)))
    .groupBy(workoutLogs.logDate);
  const setsByDate = new Map(rows.map((r) => [r.logDate, Number(r.sets)]));

  return dateRange(days, today).map((date) => ({ date, sets: setsByDate.get(date) ?? 0 }));
}
