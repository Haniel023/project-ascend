import { describe, expect, it } from "vitest";
import { computeStreakUpdate } from "../streak/streakService";

describe("computeStreakUpdate", () => {
  it("starts a streak of 1 on the very first activity", () => {
    const result = computeStreakUpdate({ currentStreak: 0, longestStreak: 0, lastActivityDate: null }, "2026-01-01");
    expect(result).toEqual({ currentStreak: 1, longestStreak: 1, lastActivityDate: "2026-01-01" });
  });

  it("increments the streak on a consecutive day", () => {
    const result = computeStreakUpdate(
      { currentStreak: 3, longestStreak: 5, lastActivityDate: "2026-01-01" },
      "2026-01-02"
    );
    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(5);
  });

  it("updates longestStreak once currentStreak surpasses it", () => {
    const result = computeStreakUpdate(
      { currentStreak: 5, longestStreak: 5, lastActivityDate: "2026-01-05" },
      "2026-01-06"
    );
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it("resets the streak to 1 after a gap day", () => {
    const result = computeStreakUpdate(
      { currentStreak: 10, longestStreak: 10, lastActivityDate: "2026-01-01" },
      "2026-01-03"
    );
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(10);
  });

  it("is a no-op when logging again on the same day", () => {
    const state = { currentStreak: 4, longestStreak: 7, lastActivityDate: "2026-01-04" };
    const result = computeStreakUpdate(state, "2026-01-04");
    expect(result).toEqual(state);
  });

  it("handles month boundaries correctly for consecutive days", () => {
    const result = computeStreakUpdate(
      { currentStreak: 2, longestStreak: 2, lastActivityDate: "2026-01-31" },
      "2026-02-01"
    );
    expect(result.currentStreak).toBe(3);
  });
});
