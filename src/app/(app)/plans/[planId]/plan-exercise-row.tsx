"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  movePlanExerciseAction,
  removePlanExerciseAction,
  updatePlanExerciseAction,
} from "@/server/actions/plan.actions";
import type { PlanDay } from "./plan-days-manager";

const NO_DAY = "none";

export type PlanExerciseRowData = {
  planExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  trackingType: string;
  muscleGroupLabel: string;
  planDayId: number | null;
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeightKg: number | null;
  targetDurationSeconds: number | null;
  notes: string | null;
  sortOrder: number;
};

function formatTarget(pe: PlanExerciseRowData) {
  const parts = [`${pe.targetSets} sets`];
  if (pe.trackingType === "duration") {
    parts.push(`${pe.targetDurationSeconds ?? 0}s hold`);
  } else if (pe.targetRepsMin != null && pe.targetRepsMax != null) {
    parts.push(pe.targetRepsMin === pe.targetRepsMax ? `${pe.targetRepsMin} reps` : `${pe.targetRepsMin}-${pe.targetRepsMax} reps`);
  }
  if (pe.targetWeightKg) parts.push(`${pe.targetWeightKg} kg`);
  return parts.join(" · ");
}

export function PlanExerciseRow({
  data,
  days,
  isFirst,
  isLast,
}: {
  data: PlanExerciseRowData;
  days: PlanDay[];
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [sets, setSets] = useState(data.targetSets);
  const [repsMin, setRepsMin] = useState(data.targetRepsMin ?? 8);
  const [repsMax, setRepsMax] = useState(data.targetRepsMax ?? 12);
  const [weightKg, setWeightKg] = useState(data.targetWeightKg ?? 0);
  const [durationSeconds, setDurationSeconds] = useState(data.targetDurationSeconds ?? 30);
  const [planDayId, setPlanDayId] = useState<string>(data.planDayId ? String(data.planDayId) : NO_DAY);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDuration = data.trackingType === "duration";
  const isBodyweightRepsOnly = data.trackingType === "reps_only";

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updatePlanExerciseAction(data.planExerciseId, {
        targetSets: sets,
        targetRepsMin: isDuration ? null : repsMin,
        targetRepsMax: isDuration ? null : repsMax,
        targetWeightKg: isDuration || isBodyweightRepsOnly ? null : weightKg,
        targetDurationSeconds: isDuration ? durationSeconds : null,
        planDayId: planDayId === NO_DAY ? null : Number(planDayId),
      });
      if (result?.error) setError(result.error);
      else setEditing(false);
    });
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardContent className="flex items-center gap-3 py-3">
        <div className="flex flex-col">
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            disabled={isFirst || isPending}
            onClick={() => startTransition(async () => { await movePlanExerciseAction(data.planExerciseId, "up"); })}
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            disabled={isLast || isPending}
            onClick={() => startTransition(async () => { await movePlanExerciseAction(data.planExerciseId, "down"); })}
          >
            <ChevronDown className="size-3.5" />
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-zinc-100">{data.exerciseName}</span>
            <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
              {data.muscleGroupLabel}
            </span>
          </div>

          {!editing && <p className="mt-0.5 text-sm text-muted-foreground">{formatTarget(data)}</p>}

          {editing && (
            <div className="mt-3 space-y-3">
              {days.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Day</Label>
                  <Select value={planDayId} onValueChange={setPlanDayId}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_DAY}>No specific day</SelectItem>
                      {days.map((day) => (
                        <SelectItem key={day.id} value={String(day.id)}>
                          {day.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Sets</Label>
                  <Input
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(Number(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>
                {isDuration ? (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Hold (seconds)</Label>
                    <Input
                      type="number"
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(Number(e.target.value))}
                      min={5}
                      max={600}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Reps min</Label>
                      <Input
                        type="number"
                        value={repsMin}
                        onChange={(e) => setRepsMin(Number(e.target.value))}
                        min={1}
                        max={100}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Reps max</Label>
                      <Input
                        type="number"
                        value={repsMax}
                        onChange={(e) => setRepsMax(Number(e.target.value))}
                        min={1}
                        max={100}
                      />
                    </div>
                  </>
                )}
              </div>
              {!isDuration && !isBodyweightRepsOnly && (
                <div className="space-y-1">
                  <Label className="text-xs">Target weight (kg)</Label>
                  <Input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    min={0}
                    max={500}
                    step={0.5}
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={isPending}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={isPending}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {!editing && (
          <div className="flex shrink-0 gap-1">
            <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-400 hover:text-red-300"
              disabled={isPending}
              onClick={() => startTransition(async () => { await removePlanExerciseAction(data.planExerciseId); })}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
