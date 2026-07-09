import { eq } from "drizzle-orm";
import { verifySession } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import {
  achievements,
  dailyQuestInstances,
  planDays,
  planExercises,
  profiles,
  userAchievements,
  weeklyBosses,
  workoutLogExercises,
  workoutLogs,
  workoutLogSets,
  workoutPlans,
  xpTransactions,
} from "@/server/db/schema";

// A Route Handler, not a Server Action -- triggering a browser file download needs a
// real HTTP response with a Content-Disposition header, which Server Actions can't
// cleanly produce. The one deliberate exception to this app's "actions for mutations,
// server components for reads" convention.
export async function GET() {
  const { userId, session } = await verifySession();

  const [
    profile,
    plans,
    days,
    exercisesOnPlans,
    logs,
    logExercises,
    logSets,
    xp,
    quests,
    bosses,
    unlockedAchievements,
  ] = await Promise.all([
    db.query.profiles.findFirst({ where: eq(profiles.userId, userId) }),
    db.query.workoutPlans.findMany({ where: eq(workoutPlans.userId, userId) }),
    db
      .select({ id: planDays.id, planId: planDays.planId, name: planDays.name, sortOrder: planDays.sortOrder })
      .from(planDays)
      .innerJoin(workoutPlans, eq(planDays.planId, workoutPlans.id))
      .where(eq(workoutPlans.userId, userId)),
    db
      .select()
      .from(planExercises)
      .innerJoin(workoutPlans, eq(planExercises.planId, workoutPlans.id))
      .where(eq(workoutPlans.userId, userId)),
    db.query.workoutLogs.findMany({ where: eq(workoutLogs.userId, userId) }),
    db
      .select()
      .from(workoutLogExercises)
      .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
      .where(eq(workoutLogs.userId, userId)),
    db
      .select({ set: workoutLogSets })
      .from(workoutLogSets)
      .innerJoin(workoutLogExercises, eq(workoutLogSets.workoutLogExerciseId, workoutLogExercises.id))
      .innerJoin(workoutLogs, eq(workoutLogExercises.workoutLogId, workoutLogs.id))
      .where(eq(workoutLogs.userId, userId)),
    db.query.xpTransactions.findMany({ where: eq(xpTransactions.userId, userId) }),
    db.query.dailyQuestInstances.findMany({ where: eq(dailyQuestInstances.userId, userId) }),
    db.query.weeklyBosses.findMany({ where: eq(weeklyBosses.userId, userId) }),
    db
      .select({ unlockedAt: userAchievements.unlockedAt, title: achievements.title, slug: achievements.slug })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId)),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    account: { email: session.user.email, name: session.user.name },
    profile,
    workoutPlans: plans,
    planDays: days,
    planExercises: exercisesOnPlans,
    workoutLogs: logs,
    workoutLogExercises: logExercises,
    workoutLogSets: logSets.map((r) => r.set),
    xpTransactions: xp,
    dailyQuestInstances: quests,
    weeklyBosses: bosses,
    unlockedAchievements,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="project-ascend-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
