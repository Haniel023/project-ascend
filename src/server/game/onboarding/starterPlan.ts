import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import { exerciseMuscleGroups, exercises, muscleGroups } from "@/server/db/schema/fitness.schema";
import type { Equipment, PrimaryGoal, StartingFitnessLevel } from "@/server/db/schema/enums";
import { getRepScheme } from "./repScheme";
import { getSplitTemplate } from "./splitTemplate";

export type StarterPlanExercise = {
  exerciseId: number;
  muscleGroupSlug: string;
  trackingType: string;
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetDurationSeconds: number | null;
  // Null = no day split (flat, full-body plan). Otherwise the name of the plan_day
  // this exercise belongs to, e.g. "Push" -- see splitTemplate.ts.
  dayName: string | null;
};

// One exercise per muscle group, chosen from the seeded catalog, filtered to gear the
// player says they have access to (bodyweight is always available as a fallback so
// this never comes up empty even if a user selects nothing else). When the target
// training frequency warrants it, exercises are distributed across named day slots
// (see splitTemplate.ts) instead of one flat full-body list.
export async function buildStarterPlanExercises({
  availableEquipment,
  startingFitnessLevel,
  primaryGoal,
  daysPerWeekTarget,
}: {
  availableEquipment: Equipment[];
  startingFitnessLevel: StartingFitnessLevel;
  primaryGoal: PrimaryGoal;
  daysPerWeekTarget: number;
}): Promise<StarterPlanExercise[]> {
  const equipmentPool = Array.from(new Set([...availableEquipment, "bodyweight" as const]));
  const scheme = getRepScheme(startingFitnessLevel, primaryGoal);

  const candidates = await db
    .select({
      exerciseId: exercises.id,
      trackingType: exercises.trackingType,
      equipment: exercises.equipment,
      muscleGroupSlug: muscleGroups.slug,
      muscleGroupSort: muscleGroups.sortOrder,
    })
    .from(exerciseMuscleGroups)
    .innerJoin(exercises, eq(exerciseMuscleGroups.exerciseId, exercises.id))
    .innerJoin(muscleGroups, eq(exerciseMuscleGroups.muscleGroupId, muscleGroups.id))
    .where(
      and(
        eq(exerciseMuscleGroups.isPrimary, true),
        eq(exercises.isSeeded, true),
        inArray(exercises.equipment, equipmentPool)
      )
    )
    .orderBy(asc(muscleGroups.sortOrder), asc(exercises.id));

  const pickedByMuscleGroup = new Map<string, (typeof candidates)[number]>();
  for (const candidate of candidates) {
    if (!pickedByMuscleGroup.has(candidate.muscleGroupSlug)) {
      pickedByMuscleGroup.set(candidate.muscleGroupSlug, candidate);
    }
  }

  function toStarterExercise(
    pick: (typeof candidates)[number],
    dayName: string | null
  ): StarterPlanExercise {
    return {
      exerciseId: pick.exerciseId,
      muscleGroupSlug: pick.muscleGroupSlug,
      trackingType: pick.trackingType,
      targetSets: scheme.sets,
      targetRepsMin: pick.trackingType === "duration" ? null : scheme.repsMin,
      targetRepsMax: pick.trackingType === "duration" ? null : scheme.repsMax,
      targetDurationSeconds: pick.trackingType === "duration" ? scheme.durationSeconds : null,
      dayName,
    };
  }

  const splitTemplate = getSplitTemplate(daysPerWeekTarget);
  if (splitTemplate.length === 0) {
    return Array.from(pickedByMuscleGroup.values()).map((pick) => toStarterExercise(pick, null));
  }

  const result: StarterPlanExercise[] = [];
  for (const day of splitTemplate) {
    for (const slug of day.muscleGroupSlugs) {
      const pick = pickedByMuscleGroup.get(slug);
      if (pick) result.push(toStarterExercise(pick, day.name));
    }
  }
  return result;
}
