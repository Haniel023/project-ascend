import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { exercises, planExercises, progressionEvents, workoutPlans } from "@/server/db/schema";
import type { Rank } from "@/server/db/schema/enums";
import { computeSuggestedTargets } from "./progressiveOverload";

// Called once per detected rank-up (from the XP ledger). Generates suggestions against
// whatever the user's active plan looks like right now and stores them on a
// progression_events row -- never applied automatically, always a user review step.
export async function generateOverloadSuggestions(params: {
  userId: string;
  fromLevel: number;
  toLevel: number;
  fromRank: Rank;
  toRank: Rank;
}): Promise<number | null> {
  const activePlan = await db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.userId, params.userId), eq(workoutPlans.isActive, true)),
  });
  if (!activePlan) return null;

  const rows = await db
    .select({
      planExerciseId: planExercises.id,
      exerciseName: exercises.name,
      equipment: exercises.equipment,
      trackingType: exercises.trackingType,
      targetSets: planExercises.targetSets,
      targetRepsMin: planExercises.targetRepsMin,
      targetRepsMax: planExercises.targetRepsMax,
      targetWeightKg: planExercises.targetWeightKg,
      targetDurationSeconds: planExercises.targetDurationSeconds,
    })
    .from(planExercises)
    .innerJoin(exercises, eq(planExercises.exerciseId, exercises.id))
    .where(eq(planExercises.planId, activePlan.id));

  if (rows.length === 0) return null;

  const suggestions = rows.map((r) => computeSuggestedTargets(r, params.toRank));

  const [event] = await db
    .insert(progressionEvents)
    .values({
      userId: params.userId,
      fromRank: params.fromRank,
      toRank: params.toRank,
      fromLevel: params.fromLevel,
      toLevel: params.toLevel,
      suggestedChangesJson: suggestions,
    })
    .returning({ id: progressionEvents.id });

  return event.id;
}
