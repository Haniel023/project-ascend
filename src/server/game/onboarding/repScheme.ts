import type { PrimaryGoal, StartingFitnessLevel } from "@/server/db/schema/enums";

export type RepScheme = {
  sets: number;
  repsMin: number;
  repsMax: number;
  durationSeconds: number;
};

// Starter-plan rep/set targets, keyed by (experience level x primary goal). These are
// deliberately conservative -- the plan gets harder over time via progressive overload
// on rank-up (server/game/overload), not by guessing an aggressive starting point.
const BASE_BY_GOAL: Record<PrimaryGoal, Omit<RepScheme, "sets">> = {
  strength: { repsMin: 4, repsMax: 6, durationSeconds: 30 },
  hypertrophy: { repsMin: 8, repsMax: 12, durationSeconds: 30 },
  endurance: { repsMin: 15, repsMax: 20, durationSeconds: 45 },
  fat_loss: { repsMin: 12, repsMax: 15, durationSeconds: 40 },
  general_fitness: { repsMin: 10, repsMax: 12, durationSeconds: 30 },
};

const SETS_BY_LEVEL: Record<StartingFitnessLevel, number> = {
  beginner: 3,
  intermediate: 3,
  advanced: 4,
};

const DURATION_SCALE_BY_LEVEL: Record<StartingFitnessLevel, number> = {
  beginner: 0.7,
  intermediate: 1,
  advanced: 1.3,
};

export function getRepScheme(level: StartingFitnessLevel, goal: PrimaryGoal): RepScheme {
  const base = BASE_BY_GOAL[goal];
  return {
    sets: SETS_BY_LEVEL[level],
    repsMin: base.repsMin,
    repsMax: base.repsMax,
    durationSeconds: Math.round(base.durationSeconds * DURATION_SCALE_BY_LEVEL[level]),
  };
}
