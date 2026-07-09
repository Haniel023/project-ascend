"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { planDays, planExercises, profiles, workoutPlans } from "@/server/db/schema";
import { buildStarterPlanExercises } from "@/server/game/onboarding/starterPlan";
import { onboardingSchema, type OnboardingInput } from "@/server/validation/onboarding.validation";

export type OnboardingActionState = { error?: string } | undefined;

export async function completeOnboardingAction(
  input: OnboardingInput
): Promise<OnboardingActionState> {
  const { userId } = await verifySession();

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const existingProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  if (existingProfile?.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  const starterExercises = await buildStarterPlanExercises({
    availableEquipment: data.availableEquipment,
    startingFitnessLevel: data.startingFitnessLevel,
    primaryGoal: data.primaryGoal,
    daysPerWeekTarget: data.daysPerWeekTarget,
  });

  const now = new Date();
  const profileValues = {
    displayName: data.displayName,
    avatarKey: data.avatarKey,
    heightCm: data.heightCm,
    weightKg: data.weightKg,
    startingFitnessLevel: data.startingFitnessLevel,
    primaryGoal: data.primaryGoal,
    availableEquipment: data.availableEquipment,
    daysPerWeekTarget: data.daysPerWeekTarget,
    timezone: data.timezone,
    disclaimerAcceptedAt: now,
    onboardingCompletedAt: now,
    updatedAt: now,
  };

  await db
    .insert(profiles)
    .values({ userId, ...profileValues })
    .onConflictDoUpdate({ target: profiles.userId, set: profileValues });

  const [plan] = await db
    .insert(workoutPlans)
    .values({
      userId,
      name: `${data.displayName}'s Foundation Plan`,
      description: "Auto-generated starter plan covering every muscle group. Adjust anytime.",
      isActive: true,
    })
    .returning({ id: workoutPlans.id });

  if (starterExercises.length > 0) {
    // Preserve first-seen day order (splitTemplate's order), not alphabetical.
    const dayNamesInOrder = [...new Set(starterExercises.map((ex) => ex.dayName).filter((n): n is string => n != null))];
    const dayIdByName = new Map<string, number>();
    if (dayNamesInOrder.length > 0) {
      const insertedDays = await db
        .insert(planDays)
        .values(dayNamesInOrder.map((name, index) => ({ planId: plan.id, name, sortOrder: index })))
        .returning({ id: planDays.id, name: planDays.name });
      for (const d of insertedDays) dayIdByName.set(d.name, d.id);
    }

    await db.insert(planExercises).values(
      starterExercises.map((ex, index) => ({
        planId: plan.id,
        exerciseId: ex.exerciseId,
        planDayId: ex.dayName ? (dayIdByName.get(ex.dayName) ?? null) : null,
        targetSets: ex.targetSets,
        targetRepsMin: ex.targetRepsMin,
        targetRepsMax: ex.targetRepsMax,
        targetDurationSeconds: ex.targetDurationSeconds,
        sortOrder: index,
      }))
    );
  }

  redirect("/dashboard");
}
