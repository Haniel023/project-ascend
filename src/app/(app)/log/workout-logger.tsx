"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { logWorkoutAction } from "@/server/actions/workoutLog.actions";
import { LogExercisePicker, type CatalogExercise, type MuscleGroupOption } from "./log-exercise-picker";
import type { PlanDay } from "@/app/(app)/plans/[planId]/plan-days-manager";

type PlanExerciseRow = {
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
};

type SetEntry = {
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  rpe: number | null;
};

type SessionExercise = {
  key: string;
  exerciseId: number;
  planExerciseId: number | null;
  exerciseName: string;
  trackingType: string;
  muscleGroupLabel: string;
  targetLabel: string | null;
  sets: SetEntry[];
};

function targetLabelFor(pe: PlanExerciseRow): string {
  const parts = [`Target: ${pe.targetSets} sets`];
  if (pe.trackingType === "duration") {
    parts.push(`${pe.targetDurationSeconds ?? 0}s`);
  } else if (pe.targetRepsMin != null && pe.targetRepsMax != null) {
    parts.push(`${pe.targetRepsMin}-${pe.targetRepsMax} reps`);
  }
  if (pe.targetWeightKg) parts.push(`${pe.targetWeightKg} kg`);
  return parts.join(" · ");
}

function defaultSetFor(ex: SessionExercise): SetEntry {
  const last = ex.sets[ex.sets.length - 1];
  if (last) return { ...last };
  return {
    reps: ex.trackingType === "reps_weight" || ex.trackingType === "reps_only" ? 10 : null,
    weightKg: ex.trackingType === "reps_weight" ? 0 : null,
    durationSeconds: ex.trackingType === "duration" ? 30 : null,
    distanceMeters: ex.trackingType === "distance" ? 1000 : null,
    rpe: null,
  };
}

function toSessionExercise(pe: PlanExerciseRow): SessionExercise {
  return {
    key: `plan-${pe.planExerciseId}`,
    exerciseId: pe.exerciseId,
    planExerciseId: pe.planExerciseId,
    exerciseName: pe.exerciseName,
    trackingType: pe.trackingType,
    muscleGroupLabel: pe.muscleGroupLabel,
    targetLabel: targetLabelFor(pe),
    sets: [],
  };
}

export function WorkoutLogger({
  planId,
  days,
  planExercises,
  catalog,
  muscleGroups,
  initialDayId = null,
  dungeonRunId = null,
}: {
  planId: number | null;
  days: PlanDay[];
  planExercises: PlanExerciseRow[];
  catalog: CatalogExercise[];
  muscleGroups: MuscleGroupOption[];
  initialDayId?: number | null;
  dungeonRunId?: number | null;
}) {
  const hasValidInitialDay = initialDayId != null && days.some((d) => d.id === initialDayId);

  // Split plans require picking which day you're doing before anything prefills;
  // flat (unsplit) plans skip straight to the full exercise list. Arriving from a
  // dungeon (initialDayId set) skips the picker too, since the day's already chosen.
  const [dayPicked, setDayPicked] = useState(days.length === 0 || hasValidInitialDay);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(() => {
    if (days.length === 0) return planExercises.map(toSessionExercise);
    if (hasValidInitialDay) {
      return planExercises.filter((pe) => pe.planDayId === initialDayId || pe.planDayId == null).map(toSessionExercise);
    }
    return [];
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function pickDay(dayId: number) {
    setSessionExercises(
      planExercises.filter((pe) => pe.planDayId === dayId || pe.planDayId == null).map(toSessionExercise)
    );
    setDayPicked(true);
  }

  function addAdHocExercise(ex: CatalogExercise) {
    setSessionExercises((prev) => [
      ...prev,
      {
        key: `adhoc-${ex.exerciseId}`,
        exerciseId: ex.exerciseId,
        planExerciseId: null,
        exerciseName: ex.name,
        trackingType: ex.trackingType,
        muscleGroupLabel: ex.muscleGroupLabel,
        targetLabel: null,
        sets: [],
      },
    ]);
  }

  function removeExercise(key: string) {
    setSessionExercises((prev) => prev.filter((e) => e.key !== key));
  }

  function addSet(key: string) {
    setSessionExercises((prev) =>
      prev.map((ex) => (ex.key === key ? { ...ex, sets: [...ex.sets, defaultSetFor(ex)] } : ex))
    );
  }

  function updateSet(key: string, index: number, patch: Partial<SetEntry>) {
    setSessionExercises((prev) =>
      prev.map((ex) =>
        ex.key === key
          ? { ...ex, sets: ex.sets.map((s, i) => (i === index ? { ...s, ...patch } : s)) }
          : ex
      )
    );
  }

  function removeSet(key: string, index: number) {
    setSessionExercises((prev) =>
      prev.map((ex) => (ex.key === key ? { ...ex, sets: ex.sets.filter((_, i) => i !== index) } : ex))
    );
  }

  const loggedExercises = sessionExercises.filter((ex) => ex.sets.length > 0);

  function handleSubmit() {
    setError(null);
    if (loggedExercises.length === 0) {
      setError("Add at least one set before finishing your workout.");
      return;
    }
    startTransition(async () => {
      const result = await logWorkoutAction({
        planId,
        dungeonRunId,
        exercises: loggedExercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          planExerciseId: ex.planExerciseId,
          sets: ex.sets,
        })),
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Log Today&apos;s Workout</h1>
            {dungeonRunId && (
              <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-300">
                Dungeon Run
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {!dayPicked
              ? "Your plan is split into days -- pick which one you're doing."
              : planId
                ? "Prefilled from your active plan. Adjust sets, or add anything extra you did."
                : "You don't have an active plan yet -- log any exercises you did today."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {dayPicked && days.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setDayPicked(false);
                setSessionExercises([]);
              }}
              className="text-sm text-muted-foreground hover:text-zinc-200"
            >
              Change day
            </button>
          )}
          <Link href="/log/history" className="text-sm text-muted-foreground hover:text-zinc-200">
            History
          </Link>
        </div>
      </div>

      {!dayPicked && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">
            Which day are you doing?
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {days.map((day) => (
              <Button key={day.id} variant="outline" size="lg" onClick={() => pickDay(day.id)}>
                {day.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {dayPicked && (
      <div className="mt-6 space-y-4">
        {sessionExercises.map((ex) => (
          <Card key={ex.key} className="border-zinc-800 bg-zinc-900">
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-100">{ex.exerciseName}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                      {ex.muscleGroupLabel}
                    </span>
                  </div>
                  {ex.targetLabel && <p className="mt-0.5 text-xs text-muted-foreground">{ex.targetLabel}</p>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeExercise(ex.key)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              <div className="mt-3 space-y-2">
                {ex.sets.map((set, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-xs text-muted-foreground">{i + 1}</span>
                    {(ex.trackingType === "reps_weight" || ex.trackingType === "reps_only") && (
                      <Input
                        type="number"
                        aria-label="Reps"
                        placeholder="Reps"
                        value={set.reps ?? ""}
                        onChange={(e) => updateSet(ex.key, i, { reps: Number(e.target.value) || null })}
                        className="h-8 min-w-0 flex-1"
                      />
                    )}
                    {ex.trackingType === "reps_weight" && (
                      <Input
                        type="number"
                        aria-label="Weight (kg)"
                        placeholder="kg"
                        step={0.5}
                        value={set.weightKg ?? ""}
                        onChange={(e) => updateSet(ex.key, i, { weightKg: Number(e.target.value) || null })}
                        className="h-8 min-w-0 flex-1"
                      />
                    )}
                    {ex.trackingType === "duration" && (
                      <Input
                        type="number"
                        aria-label="Duration (seconds)"
                        placeholder="seconds"
                        value={set.durationSeconds ?? ""}
                        onChange={(e) => updateSet(ex.key, i, { durationSeconds: Number(e.target.value) || null })}
                        className="h-8 min-w-0 flex-1"
                      />
                    )}
                    {ex.trackingType === "distance" && (
                      <Input
                        type="number"
                        aria-label="Distance (meters)"
                        placeholder="meters"
                        value={set.distanceMeters ?? ""}
                        onChange={(e) => updateSet(ex.key, i, { distanceMeters: Number(e.target.value) || null })}
                        className="h-8 min-w-0 flex-1"
                      />
                    )}
                    <Input
                      type="number"
                      aria-label="RPE (optional)"
                      placeholder="RPE"
                      min={1}
                      max={10}
                      value={set.rpe ?? ""}
                      onChange={(e) => updateSet(ex.key, i, { rpe: Number(e.target.value) || null })}
                      className="h-8 w-12 shrink-0 px-1.5 text-center"
                    />
                    <Button size="icon" variant="ghost" className="size-8 shrink-0" onClick={() => removeSet(ex.key, i)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addSet(ex.key)}>
                  + Add set
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <LogExercisePicker
          catalog={catalog}
          muscleGroups={muscleGroups}
          onSelect={addAdHocExercise}
          disabledIds={new Set(sessionExercises.map((e) => e.exerciseId))}
        />
      </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {dayPicked && (
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSubmit} disabled={isPending} size="lg">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving...
            </>
          ) : (
            "Finish workout"
          )}
        </Button>
      </div>
      )}
    </div>
  );
}
