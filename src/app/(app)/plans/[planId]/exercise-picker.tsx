"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addPlanExerciseAction, createCustomExerciseAction } from "@/server/actions/plan.actions";
import { EQUIPMENT_OPTIONS } from "@/app/(app)/onboarding/onboarding-data";
import type { PlanDay } from "./plan-days-manager";

const NO_DAY = "none";

export type CatalogExercise = {
  exerciseId: number;
  name: string;
  equipment: string;
  trackingType: string;
  muscleGroupSlug: string;
  muscleGroupLabel: string;
};

export type MuscleGroupOption = { id: number; slug: string; label: string };

const TRACKING_TYPE_OPTIONS = [
  { key: "reps_weight", label: "Reps + Weight" },
  { key: "reps_only", label: "Reps only (bodyweight)" },
  { key: "duration", label: "Duration hold" },
  { key: "distance", label: "Distance" },
] as const;

export function ExercisePicker({
  planId,
  catalog,
  muscleGroups,
  days,
}: {
  planId: number;
  catalog: CatalogExercise[];
  muscleGroups: MuscleGroupOption[];
  days: PlanDay[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string>("all");
  const [selected, setSelected] = useState<CatalogExercise | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Target-setting form state, shown once an exercise is selected.
  const [sets, setSets] = useState(3);
  const [repsMin, setRepsMin] = useState(8);
  const [repsMax, setRepsMax] = useState(12);
  const [weightKg, setWeightKg] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [planDayId, setPlanDayId] = useState<string>(NO_DAY);

  // Custom exercise creation form state.
  const [customName, setCustomName] = useState("");
  const [customEquipment, setCustomEquipment] = useState("bodyweight");
  const [customTrackingType, setCustomTrackingType] = useState("reps_weight");
  const [customMuscleGroupId, setCustomMuscleGroupId] = useState<string>(
    muscleGroups[0]?.id.toString() ?? ""
  );

  const filtered = useMemo(() => {
    return catalog.filter((ex) => {
      const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase());
      const matchesGroup = muscleFilter === "all" || ex.muscleGroupSlug === muscleFilter;
      return matchesQuery && matchesGroup;
    });
  }, [catalog, query, muscleFilter]);

  function reset() {
    setQuery("");
    setMuscleFilter("all");
    setSelected(null);
    setShowCustomForm(false);
    setError(null);
    setSets(3);
    setRepsMin(8);
    setRepsMax(12);
    setWeightKg(0);
    setDurationSeconds(30);
    setPlanDayId(NO_DAY);
  }

  function handleAdd() {
    if (!selected) return;
    setError(null);
    const isDuration = selected.trackingType === "duration";
    const isBodyweightRepsOnly = selected.trackingType === "reps_only";
    startTransition(async () => {
      const result = await addPlanExerciseAction(planId, {
        exerciseId: selected.exerciseId,
        targetSets: sets,
        targetRepsMin: isDuration ? null : repsMin,
        targetRepsMax: isDuration ? null : repsMax,
        targetWeightKg: isDuration || isBodyweightRepsOnly ? null : weightKg,
        targetDurationSeconds: isDuration ? durationSeconds : null,
        planDayId: planDayId === NO_DAY ? null : Number(planDayId),
      });
      if (result?.error) setError(result.error);
      else {
        setOpen(false);
        reset();
      }
    });
  }

  function handleCreateCustom() {
    setError(null);
    startTransition(async () => {
      const result = await createCustomExerciseAction({
        name: customName,
        equipment: customEquipment,
        trackingType: customTrackingType,
        muscleGroupId: Number(customMuscleGroupId),
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      const group = muscleGroups.find((g) => g.id === Number(customMuscleGroupId));
      setSelected({
        exerciseId: result.exerciseId!,
        name: customName,
        equipment: customEquipment,
        trackingType: customTrackingType,
        muscleGroupSlug: group?.slug ?? "",
        muscleGroupLabel: group?.label ?? "",
      });
      setShowCustomForm(false);
      setCustomName("");
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" /> Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{selected ? selected.name : "Add an exercise"}</DialogTitle>
        </DialogHeader>

        {!selected && !showCustomForm && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercises..."
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setMuscleFilter("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  muscleFilter === "all" ? "bg-amber-400 text-zinc-950" : "bg-white/10 text-zinc-400"
                )}
              >
                All
              </button>
              {muscleGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setMuscleFilter(g.slug)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    muscleFilter === g.slug ? "bg-amber-400 text-zinc-950" : "bg-white/10 text-zinc-400"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>

            <div className="max-h-80 space-y-1 overflow-y-auto">
              {filtered.map((ex) => (
                <button
                  key={ex.exerciseId}
                  type="button"
                  onClick={() => setSelected(ex)}
                  className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-left hover:border-white/20"
                >
                  <span className="text-sm text-zinc-200">{ex.name}</span>
                  <span className="text-xs text-muted-foreground">{ex.muscleGroupLabel}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">No matches.</p>
              )}
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={() => setShowCustomForm(true)}>
              Create a custom exercise
            </Button>
          </div>
        )}

        {!selected && showCustomForm && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={customName} onChange={(e) => setCustomName(e.target.value)} maxLength={60} />
            </div>
            <div className="space-y-2">
              <Label>Muscle group</Label>
              <Select value={customMuscleGroupId} onValueChange={setCustomMuscleGroupId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipment</Label>
              <Select value={customEquipment} onValueChange={setCustomEquipment}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_OPTIONS.map((e) => (
                    <SelectItem key={e.key} value={e.key}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>How is it tracked?</Label>
              <Select value={customTrackingType} onValueChange={setCustomTrackingType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRACKING_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowCustomForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCustom} disabled={customName.trim().length < 2 || isPending}>
                Create
              </Button>
            </DialogFooter>
          </div>
        )}

        {selected && (
          <div className="space-y-4">
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
                <Input type="number" value={sets} onChange={(e) => setSets(Number(e.target.value))} min={1} max={10} />
              </div>
              {selected.trackingType === "duration" ? (
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
                    <Input type="number" value={repsMin} onChange={(e) => setRepsMin(Number(e.target.value))} min={1} max={100} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Reps max</Label>
                    <Input type="number" value={repsMax} onChange={(e) => setRepsMax(Number(e.target.value))} min={1} max={100} />
                  </div>
                </>
              )}
            </div>
            {selected.trackingType === "reps_weight" && (
              <div className="space-y-1">
                <Label className="text-xs">Target weight (kg, optional)</Label>
                <Input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} min={0} max={500} step={0.5} />
              </div>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Back
              </Button>
              <Button onClick={handleAdd} disabled={isPending}>
                Add to plan
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
