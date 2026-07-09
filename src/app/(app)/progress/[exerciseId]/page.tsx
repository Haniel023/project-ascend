import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { exercises, personalRecords } from "@/server/db/schema";
import { getExerciseProgressHistory } from "@/server/queries/recordsData";
import { Card, CardContent } from "@/components/ui/card";
import { ExerciseProgressChart } from "@/components/rpg/ExerciseProgressChart";

export default async function ExerciseProgressPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId: exerciseIdParam } = await params;
  const exerciseId = Number(exerciseIdParam);
  const { userId } = await requireOnboardedProfile();

  if (!Number.isInteger(exerciseId)) notFound();

  const record = await db.query.personalRecords.findFirst({
    where: and(eq(personalRecords.userId, userId), eq(personalRecords.exerciseId, exerciseId)),
  });
  if (!record) notFound();

  const exercise = await db.query.exercises.findFirst({ where: eq(exercises.id, exerciseId) });
  if (!exercise) notFound();

  const history = await getExerciseProgressHistory(userId, exerciseId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/progress" className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-zinc-200">
        <ChevronLeft className="size-3.5" /> Back to records
      </Link>

      <h1 className="mt-3 text-2xl font-bold">{exercise.name}</h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="py-3 text-center">
            <p className="text-lg font-bold text-zinc-100">{record.bestWeightKg} kg</p>
            <p className="text-xs text-muted-foreground">Best weight</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="py-3 text-center">
            <p className="text-lg font-bold text-zinc-100">{record.bestReps}</p>
            <p className="text-xs text-muted-foreground">Best reps</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardContent className="py-3 text-center">
            <p className="text-lg font-bold text-zinc-100">{record.bestEstimated1Rm.toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">Est. 1RM</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-zinc-800 bg-zinc-900">
        <CardContent className="py-4">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
            Estimated 1RM Over Time
          </h2>
          <ExerciseProgressChart data={history} />
        </CardContent>
      </Card>
    </div>
  );
}
