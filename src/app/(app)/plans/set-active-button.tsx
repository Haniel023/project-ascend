"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setActivePlanAction } from "@/server/actions/plan.actions";

export function SetActiveButton({ planId }: { planId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(async () => { await setActivePlanAction(planId); })}
    >
      {isPending ? "Setting..." : "Set Active"}
    </Button>
  );
}
