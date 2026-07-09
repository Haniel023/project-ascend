import { describe, expect, it } from "vitest";
import {
  coverageMultiplier,
  diminishingMultiplier,
  effectiveReps,
  rawSetXp,
} from "../xp/xpFormulas";

describe("effectiveReps", () => {
  it("uses raw reps for reps_weight and reps_only", () => {
    expect(effectiveReps({ trackingType: "reps_weight", reps: 10, weightKg: 20, durationSeconds: null, distanceMeters: null })).toBe(10);
    expect(effectiveReps({ trackingType: "reps_only", reps: 15, weightKg: null, durationSeconds: null, distanceMeters: null })).toBe(15);
  });

  it("converts duration at 5 seconds per effective rep", () => {
    expect(effectiveReps({ trackingType: "duration", reps: null, weightKg: null, durationSeconds: 30, distanceMeters: null })).toBe(6);
  });

  it("converts distance at 50 meters per effective rep", () => {
    expect(effectiveReps({ trackingType: "distance", reps: null, weightKg: null, durationSeconds: null, distanceMeters: 500 })).toBe(10);
  });
});

describe("rawSetXp", () => {
  it("floors at 5 for a trivial bodyweight set", () => {
    const xp = rawSetXp({ trackingType: "reps_only", reps: 1, weightKg: null, durationSeconds: null, distanceMeters: null });
    expect(xp).toBe(6); // 5 + 1*0.5 = 5.5 -> rounds to 6
  });

  it("caps at 40 for an extreme set", () => {
    const xp = rawSetXp({ trackingType: "reps_weight", reps: 100, weightKg: 300, durationSeconds: null, distanceMeters: null });
    expect(xp).toBe(40);
  });

  it("computes a typical reps+weight set", () => {
    // 5 + 10*0.5 + 60*0.15 = 5 + 5 + 9 = 19
    const xp = rawSetXp({ trackingType: "reps_weight", reps: 10, weightKg: 60, durationSeconds: null, distanceMeters: null });
    expect(xp).toBe(19);
  });

  it("never goes below the floor even with zero values", () => {
    const xp = rawSetXp({ trackingType: "reps_only", reps: 0, weightKg: null, durationSeconds: null, distanceMeters: null });
    expect(xp).toBe(5);
  });
});

describe("diminishingMultiplier", () => {
  it.each([
    [1, 1.0],
    [10, 1.0],
    [11, 0.5],
    [20, 0.5],
    [21, 0.1],
    [50, 0.1],
  ])("set #%i for a muscle group today -> multiplier %f", (setNumber, expected) => {
    expect(diminishingMultiplier(setNumber)).toBe(expected);
  });
});

describe("coverageMultiplier", () => {
  it.each([
    [1, 0.4],
    [2, 0.6],
    [3, 0.8],
    [4, 0.9],
    [5, 1.0],
    [6, 1.05],
    [7, 1.1],
    [10, 1.1],
  ])("%i distinct muscle groups in trailing 7 days -> multiplier %f", (groups, expected) => {
    expect(coverageMultiplier(groups)).toBe(expected);
  });

  it("rewards training more muscle groups over fewer, monotonically", () => {
    const multipliers = [1, 2, 3, 4, 5, 6, 7].map(coverageMultiplier);
    for (let i = 1; i < multipliers.length; i++) {
      expect(multipliers[i]).toBeGreaterThanOrEqual(multipliers[i - 1]);
    }
  });
});
