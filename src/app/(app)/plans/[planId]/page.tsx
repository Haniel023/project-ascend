import { notFound } from "next/navigation";
import { and, asc, eq, or } from "drizzle-orm";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import {
  exerciseMuscleGroups,
  exercises,
  muscleGroups,
  planDays,
  planExercises,
  workoutPlans,
} from "@/server/db/schema";
import { PlanEditor } from "./plan-editor";

export default async function PlanEditorPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId: planIdParam } = await params;
  const planId = Number(planIdParam);
  const { userId } = await requireOnboardedProfile();

  if (!Number.isInteger(planId)) notFound();

  const plan = await db.query.workoutPlans.findFirst({ where: eq(workoutPlans.id, planId) });
  if (!plan || plan.userId !== userId) notFound();

  const planExerciseRows = await db
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
      notes: planExercises.notes,
      sortOrder: planExercises.sortOrder,
    })
    .from(planExercises)
    .innerJoin(exercises, eq(planExercises.exerciseId, exercises.id))
    .innerJoin(
      exerciseMuscleGroups,
      and(eq(exerciseMuscleGroups.exerciseId, exercises.id), eq(exerciseMuscleGroups.isPrimary, true))
    )
    .innerJoin(muscleGroups, eq(exerciseMuscleGroups.muscleGroupId, muscleGroups.id))
    .where(eq(planExercises.planId, planId))
    .orderBy(asc(planExercises.sortOrder));

  const days = await db.query.planDays.findMany({
    where: eq(planDays.planId, planId),
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });

  const catalogRows = await db
    .select({
      exerciseId: exercises.id,
      name: exercises.name,
      equipment: exercises.equipment,
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

  return (
    <PlanEditor
      plan={{ id: plan.id, name: plan.name, description: plan.description, isActive: plan.isActive }}
      days={days.map((d) => ({ id: d.id, name: d.name }))}
      planExercises={planExerciseRows}
      catalog={catalogRows}
      muscleGroups={allMuscleGroups.map((g) => ({ id: g.id, slug: g.slug, label: g.label }))}
    />
  );
}
