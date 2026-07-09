import { describe, expect, it } from "vitest";
import { estimateDungeonXp, pickNextPlanDay } from "../dungeons/dungeonGenerator";

describe("pickNextPlanDay", () => {
  it("picks the day with the fewest recent sets", () => {
    const days = [
      { id: 1, sortOrder: 0 },
      { id: 2, sortOrder: 1 },
      { id: 3, sortOrder: 2 },
    ];
    const counts = new Map([
      [1, 10],
      [2, 2],
      [3, 6],
    ]);
    expect(pickNextPlanDay(days, counts)).toBe(2);
  });

  it("breaks ties by sortOrder", () => {
    const days = [
      { id: 5, sortOrder: 2 },
      { id: 6, sortOrder: 0 },
      { id: 7, sortOrder: 1 },
    ];
    expect(pickNextPlanDay(days, new Map())).toBe(6);
  });

  it("treats an untrained day (missing from the map) as zero", () => {
    const days = [
      { id: 1, sortOrder: 0 },
      { id: 2, sortOrder: 1 },
    ];
    const counts = new Map([[1, 5]]);
    expect(pickNextPlanDay(days, counts)).toBe(2);
  });
});

describe("estimateDungeonXp", () => {
  it("returns 0 for no exercises", () => {
    expect(estimateDungeonXp([], 1, 1)).toBe(0);
  });

  it("scales up with recovery multiplier", () => {
    const exercises = [{ targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, targetWeightKg: 40 }];
    const low = estimateDungeonXp(exercises, 3, 0.9);
    const high = estimateDungeonXp(exercises, 3, 1.1);
    expect(high).toBeGreaterThan(low);
  });

  it("scales up with distinct muscle group coverage", () => {
    const exercises = [{ targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, targetWeightKg: 40 }];
    const lowCoverage = estimateDungeonXp(exercises, 1, 1);
    const highCoverage = estimateDungeonXp(exercises, 6, 1);
    expect(highCoverage).toBeGreaterThan(lowCoverage);
  });

  it("applies within-session diminishing returns across many sets", () => {
    const fewSets = estimateDungeonXp([{ targetSets: 2, targetRepsMin: 10, targetRepsMax: 10, targetWeightKg: 20 }], 5, 1);
    const manySets = estimateDungeonXp([{ targetSets: 25, targetRepsMin: 10, targetRepsMax: 10, targetWeightKg: 20 }], 5, 1);
    // Per-set average drops once diminishing returns kick in past 10 sets.
    expect(manySets / 25).toBeLessThan(fewSets / 2);
  });
});
