"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deletePlanAction, setActivePlanAction, updatePlanAction } from "@/server/actions/plan.actions";
import { PlanExerciseRow, type PlanExerciseRowData } from "./plan-exercise-row";
import { ExercisePicker, type CatalogExercise, type MuscleGroupOption } from "./exercise-picker";
import { PlanDaysManager, type PlanDay } from "./plan-days-manager";

export type PlanSummary = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
};

export function PlanEditor({
  plan,
  days,
  planExercises,
  catalog,
  muscleGroups,
}: {
  plan: PlanSummary;
  days: PlanDay[];
  planExercises: PlanExerciseRowData[];
  catalog: CatalogExercise[];
  muscleGroups: MuscleGroupOption[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updatePlanAction(plan.id, { name, description });
      if (result?.error) setError(result.error);
      else setEditOpen(false);
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/plans" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-zinc-200">
        <ArrowLeft className="size-4" /> All plans
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            {plan.isActive && (
              <Badge className="bg-amber-400 text-zinc-950 hover:bg-amber-400">Active</Badge>
            )}
          </div>
          {plan.description && <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          {!plan.isActive && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => startTransition(async () => { await setActivePlanAction(plan.id); })}
            >
              Set Active
            </Button>
          )}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Pencil className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit plan</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-plan-name">Name</Label>
                  <Input id="edit-plan-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-plan-description">Description</Label>
                  <Textarea
                    id="edit-plan-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={300}
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <DialogFooter>
                  <Button type="submit" disabled={isPending}>
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant="outline"
            className="text-red-400 hover:text-red-300"
            disabled={isPending}
            onClick={() => {
              if (confirm(`Delete "${plan.name}"? This cannot be undone.`)) {
                startTransition(async () => { await deletePlanAction(plan.id); });
              }
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <PlanDaysManager planId={plan.id} days={days} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Exercises</h2>
        <ExercisePicker planId={plan.id} catalog={catalog} muscleGroups={muscleGroups} days={days} />
      </div>

      <div className="mt-3 space-y-6">
        {planExercises.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/15 bg-white/2 py-8 text-center text-sm text-muted-foreground">
            No exercises yet. Add one to start building this plan.
          </p>
        )}

        {days.map((day) => {
          const dayExercises = planExercises.filter((pe) => pe.planDayId === day.id);
          if (dayExercises.length === 0) return null;
          return (
            <div key={day.id}>
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-amber-400 uppercase">{day.name}</h3>
              <div className="space-y-2">
                {dayExercises.map((pe, index) => (
                  <PlanExerciseRow
                    key={pe.planExerciseId}
                    data={pe}
                    days={days}
                    isFirst={index === 0}
                    isLast={index === dayExercises.length - 1}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {(() => {
          const unassigned = planExercises.filter((pe) => pe.planDayId == null);
          if (unassigned.length === 0) return null;
          return (
            <div>
              {days.length > 0 && (
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                  Unassigned
                </h3>
              )}
              <div className="space-y-2">
                {unassigned.map((pe, index) => (
                  <PlanExerciseRow
                    key={pe.planExerciseId}
                    data={pe}
                    days={days}
                    isFirst={index === 0}
                    isLast={index === unassigned.length - 1}
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
