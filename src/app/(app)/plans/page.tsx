import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireOnboardedProfile } from "@/server/auth/dal";
import { db } from "@/server/db/client";
import { workoutPlans } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewPlanDialog } from "./new-plan-dialog";
import { SetActiveButton } from "./set-active-button";

export default async function PlansPage() {
  const { userId } = await requireOnboardedProfile();

  const plans = await db.query.workoutPlans.findMany({
    where: eq(workoutPlans.userId, userId),
    with: { planExercises: true },
    orderBy: (t, { desc }) => [desc(t.isActive), desc(t.createdAt)],
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Training Plans</h1>
        <NewPlanDialog />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Only your active plan drives your daily logging and progressive overload.
      </p>

      <div className="mt-6 space-y-3">
        {plans.length === 0 && (
          <Card className="border-dashed border-zinc-700 bg-zinc-900">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No plans yet. Create one to get started.
            </CardContent>
          </Card>
        )}

        {plans.map((plan) => (
          <Card key={plan.id} className="border-zinc-800 bg-zinc-900">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link href={`/plans/${plan.id}`} className="hover:underline">
                    {plan.name}
                  </Link>
                  {plan.isActive && (
                    <Badge className="bg-amber-400 text-zinc-950 hover:bg-amber-400">Active</Badge>
                  )}
                </CardTitle>
                {plan.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.planExercises.length} exercise{plan.planExercises.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!plan.isActive && <SetActiveButton planId={plan.id} />}
                <Button asChild size="sm" variant="outline">
                  <Link href={`/plans/${plan.id}`}>Edit</Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
