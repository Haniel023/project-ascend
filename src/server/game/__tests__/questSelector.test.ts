import { describe, expect, it } from "vitest";
import { selectDailyQuestIndices } from "../quests/questSelector";

describe("selectDailyQuestIndices", () => {
  it("is deterministic for the same user and date", () => {
    const a = selectDailyQuestIndices("user-1", "2026-01-01", 20, 3);
    const b = selectDailyQuestIndices("user-1", "2026-01-01", 20, 3);
    expect(a).toEqual(b);
  });

  it("returns the requested count of unique indices within range", () => {
    const result = selectDailyQuestIndices("user-1", "2026-01-01", 20, 3);
    expect(result).toHaveLength(3);
    expect(new Set(result).size).toBe(3);
    for (const i of result) {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(20);
    }
  });

  it("differs across different days for the same user (not statically pinned)", () => {
    const day1 = selectDailyQuestIndices("user-1", "2026-01-01", 20, 3);
    const day2 = selectDailyQuestIndices("user-1", "2026-01-02", 20, 3);
    expect(day1).not.toEqual(day2);
  });

  it("differs across different users on the same day", () => {
    const userA = selectDailyQuestIndices("user-a", "2026-01-01", 20, 3);
    const userB = selectDailyQuestIndices("user-b", "2026-01-01", 20, 3);
    expect(userA).not.toEqual(userB);
  });

  it("caps the count at the pool size", () => {
    const result = selectDailyQuestIndices("user-1", "2026-01-01", 2, 5);
    expect(result).toHaveLength(2);
  });

  it("returns an empty array for an empty pool", () => {
    expect(selectDailyQuestIndices("user-1", "2026-01-01", 0, 3)).toEqual([]);
  });
});
