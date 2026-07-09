import { and, desc, eq, gte } from "drizzle-orm";
import { format, parseISO, subDays } from "date-fns";
import { db } from "@/server/db/client";
import {
  bodyStatEntries,
  exercises,
  personalRecords,
  workoutLogExercises,
  workoutLogs,
  workoutLogSets,
} from "@/server/db/schema";
import type { BodyStatPoint } from "@/components/rpg/BodyStatsChart";
import type { ExerciseProgressPoint } from "@/components/rpg/ExerciseProgressChart";
import { estimatedOneRepMax } from "@/server/game/records/estimatedOneRepMax";
import { dateRange } from "./dashboardData";

export async function getBodyStatsHistory(userId: string, today: string, days: number): Promise<BodyStatPoint[]> {
  const windowStart = format(subDays(parseISO(today), days - 1), "yyyy-MM-dd");

  const rows = await db
    .select({ recordedDate: bodyStatEntries.recordedDate, weightKg: bodyStatEntries.weightKg })
    .from(bodyStatEntries)
    .where(and(eq(bodyStatEntries.userId, userId), gte(bodyStatEntries.recordedDate, windowStart)));
  const weightByDate = new Map(rows.map((r) => [r.recordedDate, r.weightKg]));

  return dateRange(days, today).map((date) => ({ date, weightKg: weightByDate.get(date) ?? null }));
}

export type PersonalRecordSummary = {
  exerciseId: number;
  exerciseName: string;
  bestWeightKg: number;
  bestReps: number;
  bestEstimated1Rm: number;
  achievedAt: Date;
};

export async function getPersonalRecords(userId: string): Promise<PersonalRecordSummary[]> {
  const rows = await db
    .select({
      exerciseId: personalRecords.exerciseId,
      exerciseName: exercises.name,
      bestWeightKg: personalRecords.bestWeightKg,
      bestReps: personalRecords.bestReps,
      bestEstimated1Rm: personalRecords.bestEstimated1Rm,
      achievedAt: personalRecords.achievedAt,
    })
    .from(personalRecords)
    .innerJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
    .where(eq(personalRecords.userId, userId))
    .orderBy(desc(personalRecords.achievedAt));
  return rows;
}

export async function getExerciseProgressHistory(
  userId: string,
  exerciseId: number
): Promise<ExerciseProgressPoint[]> {
  const rows = await db
    .select({
      logDate: workoutLogs.logDate,
      weightKg: workoutLogSets.weightKg,
      reps: workoutLogSets.reps,
    })
    .from(workoutLogSets)
    .innerJoin(workoutLogExercises, eq(workoutLogSets.workoutLogExerciseId, workoutLogExercises.id))
    .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
    .where(and(eq(workoutLogs.userId, userId), eq(workoutLogExercises.exerciseId, exerciseId)))
    .orderBy(workoutLogs.logDate);

  const bestByDate = new Map<string, ExerciseProgressPoint>();
  for (const row of rows) {
    if (row.weightKg == null || row.reps == null) continue;
    const estimated1Rm = estimatedOneRepMax(row.weightKg, row.reps);
    const existing = bestByDate.get(row.logDate);
    if (!existing || estimated1Rm > existing.estimated1Rm) {
      bestByDate.set(row.logDate, { date: row.logDate, weightKg: row.weightKg, reps: row.reps, estimated1Rm });
    }
  }
  return [...bestByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
