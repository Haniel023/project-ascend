"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type CatalogExercise = {
  exerciseId: number;
  name: string;
  trackingType: string;
  muscleGroupSlug: string;
  muscleGroupLabel: string;
};

export type MuscleGroupOption = { id: number; slug: string; label: string };

export function LogExercisePicker({
  catalog,
  muscleGroups,
  onSelect,
  disabledIds,
}: {
  catalog: CatalogExercise[];
  muscleGroups: MuscleGroupOption[];
  onSelect: (exercise: CatalogExercise) => void;
  disabledIds: Set<number>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");

  const filtered = useMemo(() => {
    return catalog.filter((ex) => {
      const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase());
      const matchesGroup = muscleFilter === "all" || ex.muscleGroupSlug === muscleFilter;
      return matchesQuery && matchesGroup;
    });
  }, [catalog, query, muscleFilter]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus className="size-4" /> Add exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add an exercise to today&apos;s session</DialogTitle>
        </DialogHeader>
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
            {filtered.map((ex) => {
              const disabled = disabledIds.has(ex.exerciseId);
              return (
                <button
                  key={ex.exerciseId}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onSelect(ex);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-left",
                    disabled ? "opacity-40" : "hover:border-white/20"
                  )}
                >
                  <span className="text-sm text-zinc-200">
                    {ex.name} {disabled && <span className="text-xs text-muted-foreground">(already added)</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{ex.muscleGroupLabel}</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No matches.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
