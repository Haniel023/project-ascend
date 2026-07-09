"use client";

import { useState, useTransition } from "react";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { submitRecoveryCheckinAction } from "@/server/actions/recovery.actions";

const SLEEP_OPTIONS = [
  { label: "<5h", value: 4 },
  { label: "5-6h", value: 5.5 },
  { label: "6-7h", value: 6.5 },
  { label: "7-8h", value: 7.5 },
  { label: "8-9h", value: 8.5 },
  { label: "9h+", value: 9.5 },
];

const WATER_OPTIONS = [
  { label: "<1L", value: 0.5 },
  { label: "1-1.5L", value: 1.25 },
  { label: "1.5-2L", value: 1.75 },
  { label: "2-2.5L", value: 2.25 },
  { label: "2.5-3L", value: 2.75 },
  { label: "3L+", value: 3.5 },
];

const LEVEL_LABELS: Record<"energy" | "soreness" | "stress" | "mood", string[]> = {
  energy: ["Drained", "Low", "Okay", "Good", "Energized"],
  soreness: ["Very Sore", "Sore", "Some", "Minor", "Fresh"],
  stress: ["Very Stressed", "Stressed", "Neutral", "Calm", "Very Calm"],
  mood: ["Low", "Meh", "Okay", "Good", "Great"],
};

function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
            value === opt.value
              ? "border-amber-400 bg-amber-400/10 text-amber-300"
              : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function LevelPicker({
  category,
  value,
  onChange,
}: {
  category: keyof typeof LEVEL_LABELS;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <PillGroup
      options={LEVEL_LABELS[category].map((label, i) => ({ label, value: i + 1 }))}
      value={value}
      onChange={onChange}
    />
  );
}

export type RecoveryCheckinDefaults = {
  sleepHours: number;
  waterIntakeLiters: number;
  energyLevel: number;
  sorenessLevel: number;
  stressLevel: number;
  moodLevel: number;
};

const NEUTRAL_DEFAULTS: RecoveryCheckinDefaults = {
  sleepHours: 7.5,
  waterIntakeLiters: 2.25,
  energyLevel: 3,
  sorenessLevel: 3,
  stressLevel: 3,
  moodLevel: 3,
};

export function RecoveryCheckinDialog({
  defaults,
  isEdit,
}: {
  defaults?: RecoveryCheckinDefaults;
  isEdit: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RecoveryCheckinDefaults>(defaults ?? NEUTRAL_DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitRecoveryCheckinAction(form);
      if (result?.error) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <HeartPulse className="size-4" /> {isEdit ? "Edit check-in" : "Check in"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daily recovery check-in</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sleep last night</Label>
            <PillGroup options={SLEEP_OPTIONS} value={form.sleepHours} onChange={(v) => setForm({ ...form, sleepHours: v })} />
          </div>
          <div className="space-y-2">
            <Label>Water so far today</Label>
            <PillGroup
              options={WATER_OPTIONS}
              value={form.waterIntakeLiters}
              onChange={(v) => setForm({ ...form, waterIntakeLiters: v })}
            />
          </div>
          <div className="space-y-2">
            <Label>Energy</Label>
            <LevelPicker category="energy" value={form.energyLevel} onChange={(v) => setForm({ ...form, energyLevel: v })} />
          </div>
          <div className="space-y-2">
            <Label>Muscle soreness</Label>
            <LevelPicker
              category="soreness"
              value={form.sorenessLevel}
              onChange={(v) => setForm({ ...form, sorenessLevel: v })}
            />
          </div>
          <div className="space-y-2">
            <Label>Stress</Label>
            <LevelPicker category="stress" value={form.stressLevel} onChange={(v) => setForm({ ...form, stressLevel: v })} />
          </div>
          <div className="space-y-2">
            <Label>Mood</Label>
            <LevelPicker category="mood" value={form.moodLevel} onChange={(v) => setForm({ ...form, moodLevel: v })} />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending}>
            Save check-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
