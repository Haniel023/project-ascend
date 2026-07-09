"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { exerciseMuscleGroups, exercises, planDays, planExercises, workoutPlans } from "@/server/db/schema";
import {
  customExerciseSchema,
  planDaySchema,
  planExerciseSchema,
  planExerciseUpdateSchema,
  planSchema,
} from "@/server/validation/plan.validation";

type ActionResult = { error?: string; success?: true };

async function assertPlanOwnership(planId: number, userId: string) {
  const plan = await db.query.workoutPlans.findFirst({ where: eq(workoutPlans.id, planId) });
  if (!plan || plan.userId !== userId) {
    return null;
  }
  return plan;
}

async function assertPlanExerciseOwnership(planExerciseId: number, userId: string) {
  const pe = await db.query.planExercises.findFirst({
    where: eq(planExercises.id, planExerciseId),
    with: { plan: true },
  });
  if (!pe || pe.plan.userId !== userId) return null;
  return pe;
}

async function assertPlanDayOwnership(planDayId: number, userId: string) {
  const day = await db.query.planDays.findFirst({
    where: eq(planDays.id, planDayId),
    with: { plan: true },
  });
  if (!day || day.plan.userId !== userId) return null;
  return day;
}

export async function createPlanAction(input: {
  name: string;
  description?: string;
}): Promise<ActionResult> {
  const { userId } = await verifySession();
  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const existing = await db.query.workoutPlans.findMany({
    where: eq(workoutPlans.userId, userId),
    columns: { id: true },
  });

  const [plan] = await db
    .insert(workoutPlans)
    .values({
      userId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      isActive: existing.length === 0,
    })
    .returning({ id: workoutPlans.id });

  revalidatePath("/plans");
  redirect(`/plans/${plan.id}`);
}

export async function updatePlanAction(
  planId: number,
  input: { name: string; description?: string }
): Promise<ActionResult> {
  const { userId } = await verifySession();
  const plan = await assertPlanOwnership(planId, userId);
  if (!plan) return { error: "Plan not found." };

  const parsed = planSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await db
    .update(workoutPlans)
    .set({ name: parsed.data.name, description: parsed.data.description || null, updatedAt: new Date() })
    .where(eq(workoutPlans.id, planId));

  revalidatePath(`/plans/${planId}`);
  revalidatePath("/plans");
  return { success: true };
}

export async function deletePlanAction(planId: number) {
  const { userId } = await verifySession();
  const plan = await assertPlanOwnership(planId, userId);
  if (!plan) return { error: "Plan not found." };

  await db.delete(workoutPlans).where(eq(workoutPlans.id, planId));
  revalidatePath("/plans");
  redirect("/plans");
}

export async function setActivePlanAction(planId: number): Promise<ActionResult> {
  const { userId } = await verifySession();
  const plan = await assertPlanOwnership(planId, userId);
  if (!plan) return { error: "Plan not found." };

  await db.transaction(async (tx) => {
    await tx.update(workoutPlans).set({ isActive: false }).where(eq(workoutPlans.userId, userId));
    await tx.update(workoutPlans).set({ isActive: true }).where(eq(workoutPlans.id, planId));
  });

  revalidatePath("/plans");
  return { success: true };
}

export async function addPlanExerciseAction(planId: number, input: unknown): Promise<ActionResult> {
  const { userId } = await verifySession();
  const plan = await assertPlanOwnership(planId, userId);
  if (!plan) return { error: "Plan not found." };

  const parsed = planExerciseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.planDayId) {
    const day = await assertPlanDayOwnership(parsed.data.planDayId, userId);
    if (!day || day.planId !== planId) return { error: "Day not found." };
  }

  const siblings = await db.query.planExercises.findMany({
    where: eq(planExercises.planId, planId),
    columns: { sortOrder: true, exerciseId: true, planDayId: true },
  });
  const alreadyOnThisDay = siblings.some(
    (s) => s.exerciseId === parsed.data.exerciseId && s.planDayId === parsed.data.planDayId
  );
  if (alreadyOnThisDay) return { error: "That exercise is already on this day." };

  const nextSortOrder = siblings.reduce((max, s) => Math.max(max, s.sortOrder), -1) + 1;

  await db.insert(planExercises).values({
    planId,
    exerciseId: parsed.data.exerciseId,
    planDayId: parsed.data.planDayId,
    targetSets: parsed.data.targetSets,
    targetRepsMin: parsed.data.targetRepsMin,
    targetRepsMax: parsed.data.targetRepsMax,
    targetWeightKg: parsed.data.targetWeightKg,
    targetDurationSeconds: parsed.data.targetDurationSeconds,
    notes: parsed.data.notes || null,
    sortOrder: nextSortOrder,
  });

  revalidatePath(`/plans/${planId}`);
  return { success: true };
}

export async function createPlanDayAction(planId: number, name: string): Promise<ActionResult> {
  const { userId } = await verifySession();
  const plan = await assertPlanOwnership(planId, userId);
  if (!plan) return { error: "Plan not found." };

  const parsed = planDaySchema.safeParse({ name });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const siblings = await db.query.planDays.findMany({
    where: eq(planDays.planId, planId),
    columns: { sortOrder: true, name: true },
  });
  if (siblings.some((d) => d.name.toLowerCase() === parsed.data.name.toLowerCase())) {
    return { error: "A day with that name already exists." };
  }
  const nextSortOrder = siblings.reduce((max, s) => Math.max(max, s.sortOrder), -1) + 1;

  await db.insert(planDays).values({ planId, name: parsed.data.name, sortOrder: nextSortOrder });
  revalidatePath(`/plans/${planId}`);
  return { success: true };
}

export async function renamePlanDayAction(planDayId: number, name: string): Promise<ActionResult> {
  const { userId } = await verifySession();
  const day = await assertPlanDayOwnership(planDayId, userId);
  if (!day) return { error: "Not found." };

  const parsed = planDaySchema.safeParse({ name });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await db.update(planDays).set({ name: parsed.data.name }).where(eq(planDays.id, planDayId));
  revalidatePath(`/plans/${day.planId}`);
  return { success: true };
}

export async function deletePlanDayAction(planDayId: number): Promise<ActionResult> {
  const { userId } = await verifySession();
  const day = await assertPlanDayOwnership(planDayId, userId);
  if (!day) return { error: "Not found." };

  // Exercises assigned to this day fall back to "unassigned" (planDayId -> null)
  // via the schema's onDelete: 'set null' -- nothing is lost when a day is removed.
  await db.delete(planDays).where(eq(planDays.id, planDayId));
  revalidatePath(`/plans/${day.planId}`);
  return { success: true };
}

export async function movePlanDayAction(planDayId: number, direction: "up" | "down"): Promise<ActionResult> {
  const { userId } = await verifySession();
  const day = await assertPlanDayOwnership(planDayId, userId);
  if (!day) return { error: "Not found." };

  const siblings = await db.query.planDays.findMany({
    where: eq(planDays.planId, day.planId),
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });
  const idx = siblings.findIndex((s) => s.id === planDayId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return { success: true };

  const other = siblings[swapIdx];
  await db.transaction(async (tx) => {
    await tx.update(planDays).set({ sortOrder: other.sortOrder }).where(eq(planDays.id, day.id));
    await tx.update(planDays).set({ sortOrder: day.sortOrder }).where(eq(planDays.id, other.id));
  });

  revalidatePath(`/plans/${day.planId}`);
  return { success: true };
}

export async function updatePlanExerciseAction(
  planExerciseId: number,
  input: unknown
): Promise<ActionResult> {
  const { userId } = await verifySession();
  const pe = await assertPlanExerciseOwnership(planExerciseId, userId);
  if (!pe) return { error: "Not found." };

  const parsed = planExerciseUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  if (parsed.data.planDayId) {
    const day = await assertPlanDayOwnership(parsed.data.planDayId, userId);
    if (!day || day.planId !== pe.planId) return { error: "Day not found." };
  }

  await db
    .update(planExercises)
    .set({ ...parsed.data, notes: parsed.data.notes || null, updatedAt: new Date() })
    .where(eq(planExercises.id, planExerciseId));

  revalidatePath(`/plans/${pe.planId}`);
  return { success: true };
}

export async function removePlanExerciseAction(planExerciseId: number): Promise<ActionResult> {
  const { userId } = await verifySession();
  const pe = await assertPlanExerciseOwnership(planExerciseId, userId);
  if (!pe) return { error: "Not found." };

  await db.delete(planExercises).where(eq(planExercises.id, planExerciseId));
  revalidatePath(`/plans/${pe.planId}`);
  return { success: true };
}

export async function movePlanExerciseAction(
  planExerciseId: number,
  direction: "up" | "down"
): Promise<ActionResult> {
  const { userId } = await verifySession();
  const pe = await assertPlanExerciseOwnership(planExerciseId, userId);
  if (!pe) return { error: "Not found." };

  // Scoped to the same day (or the same "unassigned" bucket) -- exercises are
  // rendered grouped by day, so reordering must stay within that visual group.
  const allInPlan = await db.query.planExercises.findMany({
    where: eq(planExercises.planId, pe.planId),
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  });
  const siblings = allInPlan.filter((s) => s.planDayId === pe.planDayId);
  const idx = siblings.findIndex((s) => s.id === planExerciseId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return { success: true };

  const other = siblings[swapIdx];
  await db.transaction(async (tx) => {
    await tx.update(planExercises).set({ sortOrder: other.sortOrder }).where(eq(planExercises.id, pe.id));
    await tx.update(planExercises).set({ sortOrder: pe.sortOrder }).where(eq(planExercises.id, other.id));
  });

  revalidatePath(`/plans/${pe.planId}`);
  return { success: true };
}

export async function createCustomExerciseAction(
  input: unknown
): Promise<ActionResult & { exerciseId?: number }> {
  const { userId } = await verifySession();
  const parsed = customExerciseSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const slug = `custom-${userId.slice(0, 8)}-${Date.now()}`;
  const [exercise] = await db
    .insert(exercises)
    .values({
      slug,
      name: parsed.data.name,
      equipment: parsed.data.equipment,
      trackingType: parsed.data.trackingType,
      isSeeded: false,
      createdByUserId: userId,
    })
    .returning({ id: exercises.id });

  await db.insert(exerciseMuscleGroups).values({
    exerciseId: exercise.id,
    muscleGroupId: parsed.data.muscleGroupId,
    isPrimary: true,
  });

  revalidatePath("/plans");
  return { success: true, exerciseId: exercise.id };
}
