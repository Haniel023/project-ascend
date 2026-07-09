import { describe, expect, it } from "vitest";
import { levelForXp, xpProgress, xpRequiredForLevel } from "../xp/leveling";

describe("xpRequiredForLevel", () => {
  it("requires 0 XP for level 1", () => {
    expect(xpRequiredForLevel(1)).toBe(0);
  });

  it("increases monotonically with level", () => {
    for (let level = 2; level <= 40; level++) {
      expect(xpRequiredForLevel(level)).toBeGreaterThan(xpRequiredForLevel(level - 1));
    }
  });
});

describe("levelForXp / xpRequiredForLevel round-trip", () => {
  it("returns level 1 for 0 XP", () => {
    expect(levelForXp(0)).toBe(1);
  });

  it("returns exactly level L when given exactly the XP required for level L", () => {
    for (const level of [2, 5, 10, 20, 36]) {
      const requiredXp = xpRequiredForLevel(level);
      expect(levelForXp(requiredXp)).toBe(level);
    }
  });

  it("does not advance a level early (one XP short of the threshold)", () => {
    for (const level of [2, 5, 10, 20]) {
      const requiredXp = xpRequiredForLevel(level);
      expect(levelForXp(requiredXp - 1)).toBe(level - 1);
    }
  });
});

describe("xpProgress", () => {
  it("reports zero progress into level 1 at 0 XP", () => {
    const progress = xpProgress(0);
    expect(progress.level).toBe(1);
    expect(progress.xpIntoLevel).toBe(0);
    expect(progress.xpForNextLevel).toBe(xpRequiredForLevel(2));
  });

  it("reports partial progress mid-level", () => {
    const requiredForLevel5 = xpRequiredForLevel(5);
    const requiredForLevel6 = xpRequiredForLevel(6);
    const midpoint = Math.floor((requiredForLevel5 + requiredForLevel6) / 2);
    const progress = xpProgress(midpoint);
    expect(progress.level).toBe(5);
    expect(progress.xpIntoLevel).toBe(midpoint - requiredForLevel5);
    expect(progress.xpForNextLevel).toBe(requiredForLevel6 - requiredForLevel5);
  });
});
