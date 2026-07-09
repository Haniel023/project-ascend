// Pure XP math -- no framework or DB imports. This is the testable heart of the
// anti-gaming mechanic: XP requires genuine, balanced training, not just volume.

export type TrackingType = "reps_weight" | "reps_only" | "duration" | "distance";

export type SetInput = {
  trackingType: TrackingType;
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Converts any tracking type into a single comparable "effective reps" figure.
export function effectiveReps(set: SetInput): number {
  switch (set.trackingType) {
    case "reps_weight":
    case "reps_only":
      return set.reps ?? 0;
    case "duration":
      return (set.durationSeconds ?? 0) / 5;
    case "distance":
      return (set.distanceMeters ?? 0) / 50;
  }
}

// Base XP for a single set, before any multipliers. Floor of 5 so bodyweight/no-load
// work always counts for something; capped at 40 so no single set can dominate.
export function rawSetXp(set: SetInput): number {
  const reps = effectiveReps(set);
  const weight = set.weightKg ?? 0;
  const raw = 5 + reps * 0.5 + weight * 0.15;
  return clamp(Math.round(raw), 5, 40);
}

// Nth set (1-based) of a given muscle group logged on a given calendar day.
// Prevents spamming a single muscle group in one session for outsized XP.
export function diminishingMultiplier(setNumberForMuscleGroupToday: number): number {
  if (setNumberForMuscleGroupToday <= 10) return 1.0;
  if (setNumberForMuscleGroupToday <= 20) return 0.5;
  return 0.1;
}

// The core anti-gaming mechanic: XP scales with how many *distinct* muscle groups
// were trained in the trailing 7 days (inclusive of today) -- not how much volume.
const COVERAGE_TABLE: [maxGroups: number, multiplier: number][] = [
  [1, 0.4],
  [2, 0.6],
  [3, 0.8],
  [4, 0.9],
  [5, 1.0],
  [6, 1.05],
];

export function coverageMultiplier(distinctMuscleGroupsInWindow: number): number {
  for (const [maxGroups, multiplier] of COVERAGE_TABLE) {
    if (distinctMuscleGroupsInWindow <= maxGroups) return multiplier;
  }
  return 1.1; // 7+
}

export const DAILY_XP_CAP = 500;
