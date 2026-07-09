import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { weeklyBosses } from "@/server/db/schema";

export type BossHistoryEntry = {
  id: number;
  title: string;
  dayNameSnapshot: string;
  weekStartDate: string;
  currentProgress: number;
  requiredSets: number;
  isDefeated: boolean;
  defeatedAt: Date | null;
};

export async function getBossHistory(userId: string): Promise<BossHistoryEntry[]> {
  return db.query.weeklyBosses.findMany({
    where: eq(weeklyBosses.userId, userId),
    orderBy: desc(weeklyBosses.weekStartDate),
    columns: {
      id: true,
      title: true,
      dayNameSnapshot: true,
      weekStartDate: true,
      currentProgress: true,
      requiredSets: true,
      isDefeated: true,
      defeatedAt: true,
    },
  });
}
