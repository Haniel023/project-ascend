import type { Equipment, Rank, TrackingType } from "@/server/db/schema/enums";
import { RANK_BOUNDARIES } from "@/server/game/xp/ranks";

export type OverloadTargets = {
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeightKg: number | null;
  targetDurationSeconds: number | null;
};

export type PlanExerciseForOverload = OverloadTargets & {
  planExerciseId: number;
  exerciseName: string;
  equipment: Equipment;
  trackingType: TrackingType;
};

export type OverloadSuggestion = {
  planExerciseId: number;
  exerciseName: string;
  current: OverloadTargets;
  suggested: OverloadTargets;
};

const REP_CAP_BEFORE_HARDER_VARIANT = 20;

function incrementForEquipment(equipment: Equipment): number {
  switch (equipment) {
    case "barbell":
    case "cable":
      return 2.5;
    case "dumbbell":
      return 2;
    case "machine":
      return 5;
    default:
      return 2.5;
  }
}

function roundToIncrement(value: number, increment: number): number {
  if (increment <= 0) return value;
  return Math.round(value / increment) * increment;
}

// Never auto-applied -- always surfaced as a review screen (Apply/Dismiss per
// exercise). Triggered once per rank-up; "every 2 ranks" grants a bonus set.
export function computeSuggestedTargets(
  exercise: PlanExerciseForOverload,
  toRank: Rank
): OverloadSuggestion {
  const rankPosition = RANK_BOUNDARIES.findIndex((b) => b.rank === toRank) + 1;
  const bonusSet = rankPosition > 0 && rankPosition % 2 === 0 ? 1 : 0;

  const current: OverloadTargets = {
    targetSets: exercise.targetSets,
    targetRepsMin: exercise.targetRepsMin,
    targetRepsMax: exercise.targetRepsMax,
    targetWeightKg: exercise.targetWeightKg,
    targetDurationSeconds: exercise.targetDurationSeconds,
  };

  const suggested: OverloadTargets = { ...current, targetSets: current.targetSets + bonusSet };

  if (exercise.trackingType !== "duration" && current.targetRepsMin != null && current.targetRepsMax != null) {
    const atCap = current.targetRepsMax >= REP_CAP_BEFORE_HARDER_VARIANT;
    suggested.targetRepsMin = atCap ? current.targetRepsMin : current.targetRepsMin + 1;
    suggested.targetRepsMax = atCap ? current.targetRepsMax : current.targetRepsMax + 1;
  }

  if (exercise.trackingType === "reps_weight" && current.targetWeightKg != null && current.targetWeightKg > 0) {
    const increment = incrementForEquipment(exercise.equipment);
    let nextWeight = roundToIncrement(current.targetWeightKg * 1.075, increment);
    if (nextWeight <= current.targetWeightKg) nextWeight = current.targetWeightKg + increment;
    suggested.targetWeightKg = nextWeight;
  }

  if (exercise.trackingType === "duration" && current.targetDurationSeconds != null) {
    suggested.targetDurationSeconds = Math.round(current.targetDurationSeconds * 1.15);
  }

  return {
    planExerciseId: exercise.planExerciseId,
    exerciseName: exercise.exerciseName,
    current,
    suggested,
  };
}
