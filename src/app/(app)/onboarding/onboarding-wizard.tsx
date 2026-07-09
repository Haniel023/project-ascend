"use client";

import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboardingAction } from "@/server/actions/onboarding.actions";
import type { Equipment, PrimaryGoal, StartingFitnessLevel } from "@/server/db/schema/enums";
import {
  EQUIPMENT_OPTIONS,
  FITNESS_LEVELS,
  HERO_CLASSES,
  PRIMARY_GOAL_OPTIONS,
} from "./onboarding-data";

type WizardData = {
  displayName: string;
  avatarKey: string;
  unitSystem: "metric" | "imperial";
  heightCm: number | null;
  weightKg: number | null;
  startingFitnessLevel: StartingFitnessLevel | null;
  primaryGoal: PrimaryGoal | null;
  availableEquipment: Equipment[];
  daysPerWeekTarget: number;
  acceptedDisclaimer: boolean;
};

function cmToFeetInches(cm: number) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}
function feetInchesToCm(feet: number, inches: number) {
  return Math.round((feet * 12 + inches) * 2.54);
}
function kgToLb(kg: number) {
  return Math.round(kg * 2.20462);
}
function lbToKg(lb: number) {
  return Math.round(lb / 2.20462);
}

type StepProps = {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
};

function StepName({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">What should we call you?</Label>
        <Input
          id="displayName"
          autoFocus
          value={data.displayName}
          onChange={(e) => update({ displayName: e.target.value })}
          placeholder="Hero name"
          maxLength={40}
        />
        <p className="text-sm text-muted-foreground">
          This is the name that shows up on your character sheet and leaderboards.
        </p>
      </div>
    </div>
  );
}

function StepClass({ data, update }: StepProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {HERO_CLASSES.map(({ key, label, blurb, icon: Icon }) => {
        const selected = data.avatarKey === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => update({ avatarKey: key })}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors",
              selected
                ? "border-amber-400 bg-amber-400/10 text-amber-300"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-white/20"
            )}
          >
            <Icon className="size-6" />
            <span className="text-sm font-semibold">{label}</span>
            <span className="text-xs text-muted-foreground">{blurb}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepBody({ data, update }: StepProps) {
  const feetInches = data.heightCm ? cmToFeetInches(data.heightCm) : { feet: 5, inches: 8 };
  const lb = data.weightKg ? kgToLb(data.weightKg) : 160;

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        {(["metric", "imperial"] as const).map((unit) => (
          <button
            key={unit}
            type="button"
            onClick={() => update({ unitSystem: unit })}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              data.unitSystem === unit
                ? "bg-amber-400 text-zinc-950"
                : "bg-white/5 text-zinc-400 hover:text-zinc-200"
            )}
          >
            {unit}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Height</Label>
          {data.unitSystem === "metric" ? (
            <Input
              type="number"
              inputMode="numeric"
              value={data.heightCm ?? ""}
              onChange={(e) => update({ heightCm: e.target.value ? Number(e.target.value) : null })}
              placeholder="cm"
            />
          ) : (
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={feetInches.feet}
                onChange={(e) =>
                  update({ heightCm: feetInchesToCm(Number(e.target.value), feetInches.inches) })
                }
                placeholder="ft"
              />
              <Input
                type="number"
                inputMode="numeric"
                value={feetInches.inches}
                onChange={(e) =>
                  update({ heightCm: feetInchesToCm(feetInches.feet, Number(e.target.value)) })
                }
                placeholder="in"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Weight</Label>
          {data.unitSystem === "metric" ? (
            <Input
              type="number"
              inputMode="numeric"
              value={data.weightKg ?? ""}
              onChange={(e) => update({ weightKg: e.target.value ? Number(e.target.value) : null })}
              placeholder="kg"
            />
          ) : (
            <Input
              type="number"
              inputMode="numeric"
              value={lb}
              onChange={(e) => update({ weightKg: lbToKg(Number(e.target.value)) })}
              placeholder="lb"
            />
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Used to shape your starting plan and as a baseline for your progress insights. You
        can update this anytime from your profile.
      </p>
    </div>
  );
}

function StepLevel({ data, update }: StepProps) {
  return (
    <div className="space-y-3">
      {FITNESS_LEVELS.map(({ key, label, blurb }) => {
        const selected = data.startingFitnessLevel === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => update({ startingFitnessLevel: key })}
            className={cn(
              "flex w-full flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
              selected
                ? "border-amber-400 bg-amber-400/10"
                : "border-zinc-800 bg-zinc-900 hover:border-white/20"
            )}
          >
            <span className={cn("font-semibold", selected ? "text-amber-300" : "text-zinc-200")}>
              {label}
            </span>
            <span className="text-sm text-muted-foreground">{blurb}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepGoal({ data, update }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PRIMARY_GOAL_OPTIONS.map(({ key, label, blurb }) => {
        const selected = data.primaryGoal === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => update({ primaryGoal: key })}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
              selected
                ? "border-amber-400 bg-amber-400/10"
                : "border-zinc-800 bg-zinc-900 hover:border-white/20"
            )}
          >
            <span className={cn("font-semibold", selected ? "text-amber-300" : "text-zinc-200")}>
              {label}
            </span>
            <span className="text-sm text-muted-foreground">{blurb}</span>
          </button>
        );
      })}
    </div>
  );
}

function StepEquipment({ data, update }: StepProps) {
  function toggle(key: Equipment) {
    if (key === "bodyweight") return; // always included
    const has = data.availableEquipment.includes(key);
    update({
      availableEquipment: has
        ? data.availableEquipment.filter((k) => k !== key)
        : [...data.availableEquipment, key],
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {EQUIPMENT_OPTIONS.map(({ key, label }) => {
        const selected = key === "bodyweight" || data.availableEquipment.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            disabled={key === "bodyweight"}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              selected
                ? "border-amber-400 bg-amber-400/10 text-amber-300"
                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-white/20",
              key === "bodyweight" && "opacity-80"
            )}
          >
            {selected && <Check className="size-3.5" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

function StepTempo({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => update({ daysPerWeekTarget: Math.max(2, data.daysPerWeekTarget - 1) })}
        >
          -
        </Button>
        <div className="text-center">
          <div className="text-4xl font-bold text-amber-400">{data.daysPerWeekTarget}</div>
          <div className="text-xs text-muted-foreground">days / week</div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => update({ daysPerWeekTarget: Math.min(6, data.daysPerWeekTarget + 1) })}
        >
          +
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        How many days a week do you want to train? You can change this anytime.
      </p>
    </div>
  );
}

function StepOath({ data, update }: StepProps) {
  return (
    <div className="space-y-4">
      <Textarea
        readOnly
        className="h-32 resize-none text-sm text-zinc-400"
        value={
          "Project Ascend is a training companion, not a medical or coaching service. " +
          "Listen to your body, warm up, use good form, and consult a doctor before starting " +
          "any new training program if you have a pre-existing condition. Progress here reflects " +
          "effort, not a guarantee of results."
        }
      />
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={data.acceptedDisclaimer}
          onChange={(e) => update({ acceptedDisclaimer: e.target.checked })}
        />
        <span>I understand and accept this before beginning my journey.</span>
      </label>
    </div>
  );
}

function StepReview({ data }: StepProps) {
  const heroClass = HERO_CLASSES.find((c) => c.key === data.avatarKey);
  const level = FITNESS_LEVELS.find((l) => l.key === data.startingFitnessLevel);
  const goal = PRIMARY_GOAL_OPTIONS.find((g) => g.key === data.primaryGoal);

  const rows = [
    ["Name", data.displayName],
    ["Class", heroClass?.label],
    ["Height / Weight", `${data.heightCm} cm / ${data.weightKg} kg`],
    ["Level", level?.label],
    ["Goal", goal?.label],
    [
      "Equipment",
      data.availableEquipment
        .map((key) => EQUIPMENT_OPTIONS.find((o) => o.key === key)?.label ?? key)
        .join(", "),
    ],
    ["Training days/week", String(data.daysPerWeekTarget)],
  ] as const;

  return (
    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-zinc-200">{value}</span>
        </div>
      ))}
    </div>
  );
}

type Step = {
  title: string;
  subtitle: string;
  render: (props: StepProps) => React.ReactNode;
  isValid: (data: WizardData) => boolean;
};

const STEPS: Step[] = [
  {
    title: "Name your hero",
    subtitle: "Step into your fitness journey.",
    render: (p) => <StepName {...p} />,
    isValid: (d) => d.displayName.trim().length >= 2,
  },
  {
    title: "Choose your class",
    subtitle: "Purely flavor -- pick whatever fits your vibe.",
    render: (p) => <StepClass {...p} />,
    isValid: (d) => !!d.avatarKey,
  },
  {
    title: "Your starting stats",
    subtitle: "This shapes your starter plan and your progress insights.",
    render: (p) => <StepBody {...p} />,
    isValid: (d) => !!d.heightCm && !!d.weightKg,
  },
  {
    title: "Choose your origin",
    subtitle: "Be honest -- this sets a safe starting difficulty.",
    render: (p) => <StepLevel {...p} />,
    isValid: (d) => !!d.startingFitnessLevel,
  },
  {
    title: "Choose your path",
    subtitle: "What are you training toward?",
    render: (p) => <StepGoal {...p} />,
    isValid: (d) => !!d.primaryGoal,
  },
  {
    title: "Choose your arsenal",
    subtitle: "What equipment do you have access to?",
    render: (p) => <StepEquipment {...p} />,
    isValid: () => true,
  },
  {
    title: "Set your tempo",
    subtitle: "How many days a week can you commit?",
    render: (p) => <StepTempo {...p} />,
    isValid: () => true,
  },
  {
    title: "The adventurer's oath",
    subtitle: "One last thing before we begin.",
    render: (p) => <StepOath {...p} />,
    isValid: (d) => d.acceptedDisclaimer,
  },
  {
    title: "Forge your plan",
    subtitle: "Here's what we've got. Ready to begin?",
    render: (p) => <StepReview {...p} />,
    isValid: () => true,
  },
];

export function OnboardingWizard({ defaultName }: { defaultName: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<WizardData>({
    displayName: defaultName,
    avatarKey: "",
    unitSystem: "metric",
    heightCm: null,
    weightKg: null,
    startingFitnessLevel: null,
    primaryGoal: null,
    availableEquipment: ["bodyweight"],
    daysPerWeekTarget: 3,
    acceptedDisclaimer: false,
  });

  const update = (patch: Partial<WizardData>) => setData((d) => ({ ...d, ...patch }));

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const canAdvance = useMemo(() => step.isValid(data), [step, data]);

  function goNext() {
    setError(null);
    if (isLastStep) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      startTransition(async () => {
        const result = await completeOnboardingAction({
          displayName: data.displayName.trim(),
          avatarKey: data.avatarKey,
          heightCm: data.heightCm!,
          weightKg: data.weightKg!,
          startingFitnessLevel: data.startingFitnessLevel!,
          primaryGoal: data.primaryGoal!,
          availableEquipment: data.availableEquipment,
          daysPerWeekTarget: data.daysPerWeekTarget,
          timezone,
          acceptedDisclaimer: data.acceptedDisclaimer as true,
        });
        if (result?.error) setError(result.error);
      });
      return;
    }
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-56px)] max-w-lg flex-col justify-center px-4 py-10">
      <div className="mb-6 flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= stepIndex ? "bg-amber-400" : "bg-white/10"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={stepIndex}
          custom={direction}
          initial={{ x: direction > 0 ? 40 : -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -40 : 40, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <h1 className="text-2xl font-bold text-zinc-50">{step.title}</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">{step.subtitle}</p>
          {step.render({ data, update })}
        </motion.div>
      </AnimatePresence>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="ghost" onClick={goBack} disabled={stepIndex === 0 || isPending}>
          <ChevronLeft className="size-4" /> Back
        </Button>
        <Button type="button" onClick={goNext} disabled={!canAdvance || isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Forging your plan...
            </>
          ) : isLastStep ? (
            "Begin my journey"
          ) : (
            <>
              Continue <ChevronRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
