import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { userAchievements } from "@/server/db/schema";

export type AchievementWithStatus = {
  id: number;
  slug: string;
  title: string;
  description: string;
  iconKey: string;
  category: string;
  unlockedAt: Date | null;
};

export async function getAchievementsForUser(userId: string): Promise<AchievementWithStatus[]> {
  const all = await db.query.achievements.findMany({ orderBy: (t, { asc }) => [asc(t.id)] });
  const unlocked = await db.query.userAchievements.findMany({ where: eq(userAchievements.userId, userId) });
  const unlockedByAchievementId = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  return all.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    description: a.description,
    iconKey: a.iconKey,
    category: a.category,
    unlockedAt: unlockedByAchievementId.get(a.id) ?? null,
  }));
}
