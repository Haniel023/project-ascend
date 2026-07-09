import Link from "next/link";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { getPersonalRecords } from "@/server/queries/recordsData";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProgressPage() {
  const { userId } = await requireOnboardedProfile();
  const records = await getPersonalRecords(userId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/profile" className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-zinc-200">
        <ChevronLeft className="size-3.5" /> Back to profile
      </Link>

      <h1 className="mt-3 text-2xl font-bold">Personal Records</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your best set for every exercise you&apos;ve logged, ranked by estimated one-rep max.
      </p>

      {records.length === 0 ? (
        <Card className="mt-6 border-zinc-800 bg-zinc-900">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No personal records yet -- log a workout with weight and reps to start tracking.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {records.map((r) => (
            <Link key={r.exerciseId} href={`/progress/${r.exerciseId}`}>
              <Card className="border-zinc-800 bg-zinc-900 transition-colors hover:border-amber-400/50">
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <Trophy className="size-4 text-amber-400" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{r.exerciseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.bestWeightKg} kg x {r.bestReps} -- est. 1RM {r.bestEstimated1Rm.toFixed(1)} kg
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
