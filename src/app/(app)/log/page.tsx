import { and, asc, eq, or } from "drizzle-orm";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import {
  dungeonRuns,
  exerciseMuscleGroups,
  exercises,
  muscleGroups,
  planDays,
  planExercises,
  workoutPlans,
} from "@/server/db/schema";
import { WorkoutLogger } from "./workout-logger";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ dungeonRunId?: string }>;
}) {
  const { userId } = await requireOnboardedProfile();
  const { dungeonRunId: dungeonRunIdParam } = await searchParams;

  const dungeonRun = dungeonRunIdParam
    ? await db.query.dungeonRuns.findFirst({
        where: and(eq(dungeonRuns.id, Number(dungeonRunIdParam)), eq(dungeonRuns.userId, userId)),
      })
    : null;

  const activePlan = await db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.userId, userId), eq(workoutPlans.isActive, true)),
  });

  const planExerciseRows = activePlan
    ? await db
        .select({
          planExerciseId: planExercises.id,
          exerciseId: exercises.id,
          exerciseName: exercises.name,
          trackingType: exercises.trackingType,
          muscleGroupLabel: muscleGroups.label,
          planDayId: planExercises.planDayId,
          targetSets: planExercises.targetSets,
          targetRepsMin: planExercises.targetRepsMin,
          targetRepsMax: planExercises.targetRepsMax,
          targetWeightKg: planExercises.targetWeightKg,
          targetDurationSeconds: planExercises.targetDurationSeconds,
        })
        .from(planExercises)
        .innerJoin(exercises, eq(planExercises.exerciseId, exercises.id))
        .innerJoin(
          exerciseMuscleGroups,
          and(eq(exerciseMuscleGroups.exerciseId, exercises.id), eq(exerciseMuscleGroups.isPrimary, true))
        )
        .innerJoin(muscleGroups, eq(exerciseMuscleGroups.muscleGroupId, muscleGroups.id))
        .where(eq(planExercises.planId, activePlan.id))
        .orderBy(asc(planExercises.sortOrder))
    : [];

  const catalogRows = await db
    .select({
      exerciseId: exercises.id,
      name: exercises.name,
      trackingType: exercises.trackingType,
      muscleGroupSlug: muscleGroups.slug,
      muscleGroupLabel: muscleGroups.label,
    })
    .from(exercises)
    .innerJoin(
      exerciseMuscleGroups,
      and(eq(exerciseMuscleGroups.exerciseId, exercises.id), eq(exerciseMuscleGroups.isPrimary, true))
    )
    .innerJoin(muscleGroups, eq(exerciseMuscleGroups.muscleGroupId, muscleGroups.id))
    .where(or(eq(exercises.isSeeded, true), eq(exercises.createdByUserId, userId)))
    .orderBy(asc(muscleGroups.sortOrder), asc(exercises.name));

  const allMuscleGroups = await db.query.muscleGroups.findMany({
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });

  const days = activePlan
    ? await db.query.planDays.findMany({
        where: eq(planDays.planId, activePlan.id),
        orderBy: (t, { asc }) => [asc(t.sortOrder)],
      })
    : [];

  return (
    <WorkoutLogger
      planId={activePlan?.id ?? null}
      days={days.map((d) => ({ id: d.id, name: d.name }))}
      planExercises={planExerciseRows}
      catalog={catalogRows}
      muscleGroups={allMuscleGroups.map((g) => ({ id: g.id, slug: g.slug, label: g.label }))}
      initialDayId={dungeonRun?.planDayId ?? null}
      dungeonRunId={dungeonRun?.isCompleted ? null : (dungeonRun?.id ?? null)}
    />
  );
}
