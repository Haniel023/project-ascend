import { describe, expect, it } from "vitest";
import { isAchievementUnlocked, type AchievementStats } from "../achievements/achievementDefinitions";

const baseStats: AchievementStats = {
  longestStreak: 0,
  level: 1,
  totalWorkouts: 0,
  bossDefeats: 0,
  maxWeeklyMuscleGroupCoverage: 0,
};

describe("isAchievementUnlocked", () => {
  it("evaluates streak criteria against longestStreak, not currentStreak", () => {
    expect(isAchievementUnlocked({ type: "streak", value: 7 }, { ...baseStats, longestStreak: 7 })).toBe(true);
    expect(isAchievementUnlocked({ type: "streak", value: 7 }, { ...baseStats, longestStreak: 6 })).toBe(false);
  });

  it("evaluates level criteria", () => {
    expect(isAchievementUnlocked({ type: "level", value: 6 }, { ...baseStats, level: 6 })).toBe(true);
    expect(isAchievementUnlocked({ type: "level", value: 6 }, { ...baseStats, level: 5 })).toBe(false);
  });

  it("evaluates totalWorkouts criteria", () => {
    expect(isAchievementUnlocked({ type: "totalWorkouts", value: 1 }, { ...baseStats, totalWorkouts: 1 })).toBe(true);
    expect(isAchievementUnlocked({ type: "totalWorkouts", value: 1 }, { ...baseStats, totalWorkouts: 0 })).toBe(false);
  });

  it("evaluates bossDefeats criteria", () => {
    expect(isAchievementUnlocked({ type: "bossDefeats", value: 5 }, { ...baseStats, bossDefeats: 5 })).toBe(true);
    expect(isAchievementUnlocked({ type: "bossDefeats", value: 5 }, { ...baseStats, bossDefeats: 4 })).toBe(false);
  });

  it("evaluates weeklyMuscleGroupCoverage criteria", () => {
    expect(
      isAchievementUnlocked({ type: "weeklyMuscleGroupCoverage", value: 8 }, { ...baseStats, maxWeeklyMuscleGroupCoverage: 8 })
    ).toBe(true);
    expect(
      isAchievementUnlocked({ type: "weeklyMuscleGroupCoverage", value: 8 }, { ...baseStats, maxWeeklyMuscleGroupCoverage: 7 })
    ).toBe(false);
  });
});
