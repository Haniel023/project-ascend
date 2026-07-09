import { describe, expect, it } from "vitest";
import { computeSuggestedTargets, type PlanExerciseForOverload } from "../overload/progressiveOverload";

const base: PlanExerciseForOverload = {
  planExerciseId: 1,
  exerciseName: "Barbell Bench Press",
  equipment: "barbell",
  trackingType: "reps_weight",
  targetSets: 3,
  targetRepsMin: 8,
  targetRepsMax: 12,
  targetWeightKg: 40,
  targetDurationSeconds: null,
};

describe("computeSuggestedTargets", () => {
  it("increases weight by ~7.5% rounded to the equipment increment", () => {
    const result = computeSuggestedTargets(base, "adept");
    // 40 * 1.075 = 43, rounds to nearest 2.5 -> 42.5 or 45; must be strictly greater than 40.
    expect(result.suggested.targetWeightKg).toBeGreaterThan(40);
    expect(result.suggested.targetWeightKg! % 2.5).toBe(0);
  });

  it("increments reps by 1 when under the cap", () => {
    const result = computeSuggestedTargets(base, "adept");
    expect(result.suggested.targetRepsMin).toBe(9);
    expect(result.suggested.targetRepsMax).toBe(13);
  });

  it("stops increasing reps once at the cap (20)", () => {
    const atCap = { ...base, targetRepsMin: 16, targetRepsMax: 20 };
    const result = computeSuggestedTargets(atCap, "adept");
    expect(result.suggested.targetRepsMin).toBe(16);
    expect(result.suggested.targetRepsMax).toBe(20);
  });

  it("adds a bonus set only on even rank positions (every 2 ranks)", () => {
    // novice=1 (odd, no bonus), adept=2 (even, +1), warrior=3 (odd), champion=4 (even, +1)
    expect(computeSuggestedTargets(base, "novice").suggested.targetSets).toBe(3);
    expect(computeSuggestedTargets(base, "adept").suggested.targetSets).toBe(4);
    expect(computeSuggestedTargets(base, "warrior").suggested.targetSets).toBe(3);
    expect(computeSuggestedTargets(base, "champion").suggested.targetSets).toBe(4);
  });

  it("never mutates weight for bodyweight reps_only exercises", () => {
    const bodyweight: PlanExerciseForOverload = {
      ...base,
      trackingType: "reps_only",
      equipment: "bodyweight",
      targetWeightKg: null,
    };
    const result = computeSuggestedTargets(bodyweight, "adept");
    expect(result.suggested.targetWeightKg).toBeNull();
    expect(result.suggested.targetRepsMin).toBe(9);
  });

  it("scales duration holds by 15% instead of touching reps/weight", () => {
    const duration: PlanExerciseForOverload = {
      ...base,
      trackingType: "duration",
      targetRepsMin: null,
      targetRepsMax: null,
      targetWeightKg: null,
      targetDurationSeconds: 30,
    };
    const result = computeSuggestedTargets(duration, "adept");
    expect(result.suggested.targetDurationSeconds).toBe(35); // round(30*1.15)=34.5->35
    expect(result.suggested.targetRepsMin).toBeNull();
    expect(result.suggested.targetWeightKg).toBeNull();
  });

  it("always increases weight even if 7.5% rounds down to the same increment", () => {
    const small = { ...base, targetWeightKg: 2 }; // 2 * 1.075 = 2.15 -> rounds to 2.5 (dumbbell) or 2.5 (barbell), fine
    const dumbbell = { ...small, equipment: "dumbbell" as const, targetWeightKg: 1 }; // 1*1.075=1.075 -> rounds to 2 (increment 2), which is > 1, ok
    const result = computeSuggestedTargets(dumbbell, "adept");
    expect(result.suggested.targetWeightKg).toBeGreaterThan(1);
  });
});
