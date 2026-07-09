"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getLocalDateString } from "@/lib/dates";
import { recoveryCheckinSchema } from "@/server/validation/recovery.validation";
import { submitRecoveryCheckin } from "@/server/game/recovery/recoveryService";

type ActionResult = { error?: string; success?: true };

export async function submitRecoveryCheckinAction(input: unknown): Promise<ActionResult> {
  const { userId } = await verifySession();
  const parsed = recoveryCheckinSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  const checkinDate = getLocalDateString(profile?.timezone ?? "UTC");

  await submitRecoveryCheckin({ userId, checkinDate, ...parsed.data });

  revalidatePath("/dashboard");
  return { success: true };
}
