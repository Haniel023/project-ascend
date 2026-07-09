import { and, asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { dailyQuestInstances, questTemplates } from "@/server/db/schema";
import { selectDailyQuestIndices } from "./questSelector";

const QUESTS_PER_DAY = 3;

// Idempotent: relies on the (userId, assignedDate, questTemplateId) unique constraint
// to survive concurrent requests/tabs generating the same day's quests simultaneously.
export async function ensureDailyQuests(userId: string, assignedDate: string) {
  const existing = await fetchInstances(userId, assignedDate);
  if (existing.length > 0) return existing;

  const allTemplates = await db.query.questTemplates.findMany({
    where: eq(questTemplates.isActive, true),
    orderBy: asc(questTemplates.id),
  });
  if (allTemplates.length === 0) return [];

  const indices = selectDailyQuestIndices(userId, assignedDate, allTemplates.length, QUESTS_PER_DAY);
  const chosen = indices.map((i) => allTemplates[i]);

  await db
    .insert(dailyQuestInstances)
    .values(chosen.map((t) => ({ userId, questTemplateId: t.id, assignedDate })))
    .onConflictDoNothing({
      target: [dailyQuestInstances.userId, dailyQuestInstances.assignedDate, dailyQuestInstances.questTemplateId],
    });

  return fetchInstances(userId, assignedDate);
}

function fetchInstances(userId: string, assignedDate: string) {
  return db.query.dailyQuestInstances.findMany({
    where: and(eq(dailyQuestInstances.userId, userId), eq(dailyQuestInstances.assignedDate, assignedDate)),
    with: { questTemplate: true },
    orderBy: (t, { asc }) => [asc(t.id)],
  });
}
