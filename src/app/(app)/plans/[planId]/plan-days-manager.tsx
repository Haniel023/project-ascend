"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createPlanDayAction,
  deletePlanDayAction,
  movePlanDayAction,
  renamePlanDayAction,
} from "@/server/actions/plan.actions";

export type PlanDay = { id: number; name: string };

function DayChip({ day, isFirst, isLast }: { day: PlanDay; isFirst: boolean; isLast: boolean }) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(day.name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRename() {
    setError(null);
    startTransition(async () => {
      const result = await renamePlanDayAction(day.id, name);
      if (result?.error) setError(result.error);
      else setRenaming(false);
    });
  }

  if (renaming) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
          className="h-7 w-28"
        />
        <Button size="sm" className="h-7" disabled={isPending} onClick={handleRename}>
          Save
        </Button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/4 py-1 pr-1 pl-3 text-sm">
      <span className="font-medium text-zinc-100">{day.name}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="size-6" disabled={isPending}>
            <MoreVertical className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenaming(true)}>
            <Pencil className="size-3.5" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isFirst}
            onClick={() => startTransition(async () => { await movePlanDayAction(day.id, "up"); })}
          >
            <ChevronUp className="size-3.5" /> Move earlier
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isLast}
            onClick={() => startTransition(async () => { await movePlanDayAction(day.id, "down"); })}
          >
            <ChevronDown className="size-3.5" /> Move later
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (confirm(`Delete "${day.name}"? Exercises on it become unassigned, not deleted.`)) {
                startTransition(async () => { await deletePlanDayAction(day.id); });
              }
            }}
          >
            <Trash2 className="size-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function PlanDaysManager({ planId, days }: { planId: number; days: PlanDay[] }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const result = await createPlanDayAction(planId, name);
      if (result?.error) setError(result.error);
      else {
        setName("");
        setAdding(false);
      }
    });
  }

  return (
    <div>
      <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">Days</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Split this plan into named days (Push, Pull, Legs...). You pick which one you're doing
        each time you log -- they aren't tied to calendar weekdays.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {days.map((day, i) => (
          <DayChip key={day.id} day={day} isFirst={i === 0} isLast={i === days.length - 1} />
        ))}
        {adding ? (
          <div className="flex items-center gap-1">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Push"
              className="h-7 w-28"
              maxLength={40}
            />
            <Button size="sm" className="h-7" disabled={isPending || name.trim().length === 0} onClick={handleAdd}>
              Add
            </Button>
            <Button size="sm" variant="ghost" className="h-7" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="size-3.5" /> Add day
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
