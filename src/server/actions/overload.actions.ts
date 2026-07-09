"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { planExercises, progressionEvents } from "@/server/db/schema";
import type { OverloadSuggestion } from "@/server/game/overload/progressiveOverload";

type ActionResult = { error?: string; success?: true };

export async function applyOverloadSuggestionsAction(
  eventId: number,
  planExerciseIdsToApply: number[]
): Promise<ActionResult> {
  const { userId } = await verifySession();
  const event = await db.query.progressionEvents.findFirst({ where: eq(progressionEvents.id, eventId) });
  if (!event || event.userId !== userId) return { error: "Not found." };

  const suggestions = (event.suggestedChangesJson as OverloadSuggestion[] | null) ?? [];
  const toApply = suggestions.filter((s) => planExerciseIdsToApply.includes(s.planExerciseId));

  await db.transaction(async (tx) => {
    for (const s of toApply) {
      await tx
        .update(planExercises)
        .set({
          targetSets: s.suggested.targetSets,
          targetRepsMin: s.suggested.targetRepsMin,
          targetRepsMax: s.suggested.targetRepsMax,
          targetWeightKg: s.suggested.targetWeightKg,
          targetDurationSeconds: s.suggested.targetDurationSeconds,
          updatedAt: new Date(),
        })
        .where(eq(planExercises.id, s.planExerciseId));
    }
    await tx
      .update(progressionEvents)
      .set({ appliedByUser: true, appliedAt: new Date() })
      .where(eq(progressionEvents.id, eventId));
  });

  revalidatePath("/plans");
  redirect("/dashboard");
}

export async function dismissOverloadSuggestionsAction(eventId: number) {
  const { userId } = await verifySession();
  const event = await db.query.progressionEvents.findFirst({ where: eq(progressionEvents.id, eventId) });
  if (!event || event.userId !== userId) redirect("/dashboard");

  await db
    .update(progressionEvents)
    .set({ appliedAt: new Date() })
    .where(eq(progressionEvents.id, eventId));

  redirect("/dashboard");
}
