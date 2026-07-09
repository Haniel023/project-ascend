"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { bodyStatEntries, profiles } from "@/server/db/schema";
import { getLocalDateString } from "@/lib/dates";
import { profileUpdateSchema } from "@/server/validation/profile.validation";

type ActionResult = { error?: string; success?: true };

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const { userId } = await verifySession();
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });

  await db
    .update(profiles)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(profiles.userId, userId));

  // Body-stat trend history: profiles.heightCm/weightKg stay the cached "current"
  // values, this table is what BodyStatsChart reads. One row per day, upserted, so
  // editing your weight multiple times in one day updates today's entry rather than
  // creating duplicates.
  const recordedDate = getLocalDateString(profile?.timezone ?? "UTC");
  await db
    .insert(bodyStatEntries)
    .values({
      userId,
      recordedDate,
      heightCm: parsed.data.heightCm,
      weightKg: parsed.data.weightKg,
    })
    .onConflictDoUpdate({
      target: [bodyStatEntries.userId, bodyStatEntries.recordedDate],
      set: { heightCm: parsed.data.heightCm, weightKg: parsed.data.weightKg },
    });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
