import { desc, eq } from "drizzle-orm";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { workoutLogs } from "@/server/db/schema";
import { Card, CardContent } from "@/components/ui/card";

export default async function LogHistoryPage() {
  const { userId } = await requireOnboardedProfile();

  const logs = await db.query.workoutLogs.findMany({
    where: eq(workoutLogs.userId, userId),
    orderBy: [desc(workoutLogs.logDate), desc(workoutLogs.performedAt)],
    limit: 30,
    with: {
      exercises: {
        with: { exercise: { columns: { name: true } }, muscleGroup: { columns: { label: true } }, sets: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Workout History</h1>

      <div className="mt-6 space-y-3">
        {logs.length === 0 && (
          <Card className="border-dashed border-zinc-700 bg-zinc-900">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No workouts logged yet.
            </CardContent>
          </Card>
        )}

        {logs.map((log) => {
          const muscleGroupsCovered = [...new Set(log.exercises.map((e) => e.muscleGroup.label))];
          const totalSets = log.exercises.reduce((sum, e) => sum + e.sets.length, 0);
          return (
            <Card key={log.id} className="border-zinc-800 bg-zinc-900">
              <CardContent className="py-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-zinc-100">{log.logDate}</span>
                  <span className="text-xs text-muted-foreground">
                    {log.exercises.length} exercise{log.exercises.length === 1 ? "" : "s"} · {totalSets} sets
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {muscleGroupsCovered.map((label) => (
                    <span key={label} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                      {label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
