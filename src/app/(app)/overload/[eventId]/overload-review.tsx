"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { OverloadSuggestion, OverloadTargets } from "@/server/game/overload/progressiveOverload";
import type { Rank } from "@/server/db/schema/enums";
import { applyOverloadSuggestionsAction, dismissOverloadSuggestionsAction } from "@/server/actions/overload.actions";

const RANK_LABELS: Record<Rank, string> = {
  novice: "Novice",
  adept: "Adept",
  warrior: "Warrior",
  champion: "Champion",
  legend: "Legend",
};

function formatTargets(t: OverloadTargets, trackingType?: string) {
  const parts = [`${t.targetSets} sets`];
  if (t.targetDurationSeconds != null) parts.push(`${t.targetDurationSeconds}s`);
  else if (t.targetRepsMin != null && t.targetRepsMax != null) parts.push(`${t.targetRepsMin}-${t.targetRepsMax} reps`);
  if (t.targetWeightKg) parts.push(`${t.targetWeightKg} kg`);
  return parts.join(" · ");
}

export function OverloadReview({
  eventId,
  fromRank,
  toRank,
  alreadyApplied,
  suggestions,
}: {
  eventId: number;
  fromRank: Rank;
  toRank: Rank;
  alreadyApplied: boolean;
  suggestions: OverloadSuggestion[];
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set(suggestions.map((s) => s.planExerciseId)));
  const [isPending, startTransition] = useTransition();

  function toggle(planExerciseId: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(planExerciseId)) next.delete(planExerciseId);
      else next.add(planExerciseId);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2 text-amber-400">
        <Sparkles className="size-5" />
        <span className="text-sm font-semibold tracking-wide uppercase">Rank Up</span>
      </div>
      <h1 className="mt-2 text-2xl font-bold">
        {RANK_LABELS[fromRank]} <ArrowRight className="inline size-5" /> {RANK_LABELS[toRank]}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {alreadyApplied
          ? "You already reviewed this rank-up."
          : "Your training has earned a harder plan. Review each suggested change -- nothing is applied until you say so."}
      </p>

      <div className="mt-6 space-y-2">
        {suggestions.length === 0 && (
          <Card className="border-dashed border-zinc-700 bg-zinc-900">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No active plan to suggest changes for.
            </CardContent>
          </Card>
        )}
        {suggestions.map((s) => (
          <Card key={s.planExerciseId} className="border-zinc-800 bg-zinc-900">
            <CardContent className="flex items-start gap-3 py-4">
              <Checkbox
                checked={selected.has(s.planExerciseId)}
                onCheckedChange={() => toggle(s.planExerciseId)}
                disabled={alreadyApplied}
                className="mt-1"
              />
              <div>
                <p className="font-medium text-zinc-100">{s.exerciseName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatTargets(s.current)} <ArrowRight className="inline size-3" />{" "}
                  <span className="text-amber-300">{formatTargets(s.suggested)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!alreadyApplied && suggestions.length > 0 && (
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            disabled={isPending}
            onClick={() => startTransition(async () => { await dismissOverloadSuggestionsAction(eventId); })}
          >
            Dismiss all
          </Button>
          <Button
            disabled={isPending || selected.size === 0}
            onClick={() =>
              startTransition(async () => {
                await applyOverloadSuggestionsAction(eventId, [...selected]);
              })
            }
          >
            Apply selected ({selected.size})
          </Button>
        </div>
      )}
    </div>
  );
}
