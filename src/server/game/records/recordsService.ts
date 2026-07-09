import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { exercises, personalRecords, workoutLogExercises, workoutLogSets } from "@/server/db/schema";
import { estimatedOneRepMax } from "./estimatedOneRepMax";

export type NewPersonalRecord = { exerciseName: string; weightKg: number; reps: number };

// Compares every completed set from a just-logged workout against the user's cached
// best per exercise, upserting personalRecords wherever a set beats it. Cheap enough
// to call after every workout log, same as achievement/boss checks.
export async function checkAndRecordPersonalRecords(
  userId: string,
  workoutLogId: number
): Promise<NewPersonalRecord[]> {
  const rows = await db
    .select({
      exerciseId: workoutLogExercises.exerciseId,
      exerciseName: exercises.name,
      weightKg: workoutLogSets.weightKg,
      reps: workoutLogSets.reps,
      setId: workoutLogSets.id,
    })
    .from(workoutLogSets)
    .innerJoin(workoutLogExercises, eq(workoutLogSets.workoutLogExerciseId, workoutLogExercises.id))
    .innerJoin(exercises, eq(workoutLogExercises.exerciseId, exercises.id))
    .where(eq(workoutLogExercises.workoutLogId, workoutLogId));

  // Best set per exercise within this workout -- if someone logs the same exercise
  // twice in one session, only the strongest set is worth comparing against history.
  const bestByExercise = new Map<
    number,
    { exerciseName: string; weightKg: number; reps: number; setId: number; estimated1Rm: number }
  >();
  for (const row of rows) {
    if (row.weightKg == null || row.reps == null) continue;
    const estimated1Rm = estimatedOneRepMax(row.weightKg, row.reps);
    const existing = bestByExercise.get(row.exerciseId);
    if (!existing || estimated1Rm > existing.estimated1Rm) {
      bestByExercise.set(row.exerciseId, {
        exerciseName: row.exerciseName,
        weightKg: row.weightKg,
        reps: row.reps,
        setId: row.setId,
        estimated1Rm,
      });
    }
  }

  const newRecords: NewPersonalRecord[] = [];

  for (const [exerciseId, candidate] of bestByExercise) {
    const current = await db.query.personalRecords.findFirst({
      where: and(eq(personalRecords.userId, userId), eq(personalRecords.exerciseId, exerciseId)),
    });

    if (current && current.bestEstimated1Rm >= candidate.estimated1Rm) continue;

    await db
      .insert(personalRecords)
      .values({
        userId,
        exerciseId,
        bestWeightKg: candidate.weightKg,
        bestReps: candidate.reps,
        bestEstimated1Rm: candidate.estimated1Rm,
        achievedAt: new Date(),
        workoutLogSetId: candidate.setId,
      })
      .onConflictDoUpdate({
        target: [personalRecords.userId, personalRecords.exerciseId],
        set: {
          bestWeightKg: candidate.weightKg,
          bestReps: candidate.reps,
          bestEstimated1Rm: candidate.estimated1Rm,
          achievedAt: new Date(),
          workoutLogSetId: candidate.setId,
          updatedAt: new Date(),
        },
      });

    newRecords.push({ exerciseName: candidate.exerciseName, weightKg: candidate.weightKg, reps: candidate.reps });
  }

  return newRecords;
}
