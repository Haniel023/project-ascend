"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { dailyQuestInstances, profiles } from "@/server/db/schema";
import { getLocalDateString } from "@/lib/dates";
import { applyQuestXp } from "@/server/game/xp/xpLedger";
import { checkAndUnlockAchievements } from "@/server/game/achievements/achievementService";

type ActionResult = { error?: string; success?: true; xpAwarded?: number };

export async function completeQuestAction(questInstanceId: number): Promise<ActionResult> {
  const { userId } = await verifySession();

  const instance = await db.query.dailyQuestInstances.findFirst({
    where: eq(dailyQuestInstances.id, questInstanceId),
    with: { questTemplate: true },
  });
  if (!instance || instance.userId !== userId) return { error: "Quest not found." };
  if (instance.status === "completed") return { success: true, xpAwarded: 0 };

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });
  const timezone = profile?.timezone ?? "UTC";
  const logDate = getLocalDateString(timezone);

  const xpResult = await applyQuestXp({
    userId,
    logDate,
    bonusXp: instance.questTemplate.bonusXp,
    questInstanceId,
  });

  await db
    .update(dailyQuestInstances)
    .set({
      status: "completed",
      completedAt: new Date(),
      xpTransactionId: xpResult.xpTransactionIds[0] ?? null,
    })
    .where(eq(dailyQuestInstances.id, questInstanceId));

  await checkAndUnlockAchievements(userId);

  revalidatePath("/quests");
  revalidatePath("/dashboard");
  return { success: true, xpAwarded: xpResult.xpAwarded };
}
