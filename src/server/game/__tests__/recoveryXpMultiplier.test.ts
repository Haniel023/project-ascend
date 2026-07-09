import { describe, expect, it } from "vitest";
import { recoveryXpMultiplier } from "../recovery/recoveryXpMultiplier";

describe("recoveryXpMultiplier", () => {
  it.each([
    [0, 0.9],
    [39, 0.9],
    [40, 0.95],
    [59, 0.95],
    [60, 1.0],
    [79, 1.0],
    [80, 1.05],
    [89, 1.05],
    [90, 1.1],
    [100, 1.1],
  ])("recovery score %i -> multiplier %f", (score, expected) => {
    expect(recoveryXpMultiplier(score)).toBe(expected);
  });

  it("never drops below the 0.9x floor", () => {
    expect(recoveryXpMultiplier(0)).toBeGreaterThanOrEqual(0.9);
  });

  it("is monotonically non-decreasing as recovery improves", () => {
    const scores = [0, 20, 40, 60, 80, 100];
    const multipliers = scores.map(recoveryXpMultiplier);
    for (let i = 1; i < multipliers.length; i++) {
      expect(multipliers[i]).toBeGreaterThanOrEqual(multipliers[i - 1]);
    }
  });
});
