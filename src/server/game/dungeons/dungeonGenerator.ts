// Pure dungeon-generation math -- no framework or DB imports. Mirrors xpFormulas.ts's
// role: the testable heart of the mechanic, with all DB reads/writes left to
// dungeonService.ts.

import { coverageMultiplier, diminishingMultiplier, rawSetXp } from "@/server/game/xp/xpFormulas";

export type PlanDayOption = { id: number; sortOrder: number };

// Picks the plan day with the fewest sets logged against it in the trailing window --
// a natural rotation toward whatever's been neglected. Plan days have no calendar
// binding (see fitness.schema.ts's plan_day comment), so this is how "today's day"
// gets decided instead of reading some non-existent day-of-week column. Ties broken
// by sortOrder so a brand-new plan (all counts 0) rotates in a stable, predictable order.
export function pickNextPlanDay(days: PlanDayOption[], recentSetCounts: Map<number, number>): number {
  const sorted = [...days].sort((a, b) => {
    const countA = recentSetCounts.get(a.id) ?? 0;
    const countB = recentSetCounts.get(b.id) ?? 0;
    if (countA !== countB) return countA - countB;
    return a.sortOrder - b.sortOrder;
  });
  return sorted[0].id;
}

export type EstimateExerciseInput = {
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  targetWeightKg: number | null;
};

// A rough, pre-workout estimate shown as flavor text -- the real XP is always computed
// by xpLedger.ts's applyWorkoutXp at actual log time from the sets the user really did.
// This reuses the same rawSetXp/diminishingMultiplier/coverageMultiplier formulas so
// the estimate is at least directionally consistent with how XP actually gets scored.
export function estimateDungeonXp(
  exercises: EstimateExerciseInput[],
  distinctMuscleGroupCount: number,
  recoveryMultiplier: number
): number {
  const coverage = coverageMultiplier(distinctMuscleGroupCount);
  let total = 0;
  let setIndex = 0;

  for (const exercise of exercises) {
    const reps =
      exercise.targetRepsMin != null && exercise.targetRepsMax != null
        ? Math.round((exercise.targetRepsMin + exercise.targetRepsMax) / 2)
        : (exercise.targetRepsMin ?? exercise.targetRepsMax ?? 10);
    const setXp = rawSetXp({
      trackingType: "reps_weight",
      reps,
      weightKg: exercise.targetWeightKg,
      durationSeconds: null,
      distanceMeters: null,
    });
    for (let i = 0; i < exercise.targetSets; i++) {
      setIndex++;
      total += setXp * diminishingMultiplier(setIndex);
    }
  }

  return Math.round(total * coverage * recoveryMultiplier);
}
