import { describe, expect, it } from "vitest";
import {
  computeRecoveryScore,
  hydrationScore,
  intensityScore,
  sleepScore,
  streakScore,
  subjectiveLevelScore,
  suggestedRecoveryAction,
} from "../recovery/recoveryScore";

describe("sleepScore", () => {
  it.each([
    [7, 100],
    [8, 100],
    [9, 100],
    [3, 10],
    [1, 10],
    [12, 50],
  ])("%i hours -> %i", (hours, expected) => {
    expect(sleepScore(hours)).toBe(expected);
  });

  it("falls off below the ideal band and above it", () => {
    expect(sleepScore(5)).toBeLessThan(sleepScore(7));
    expect(sleepScore(10)).toBeLessThan(sleepScore(9));
  });
});

describe("hydrationScore", () => {
  it.each([
    [2.5, 100],
    [3, 100],
    [0, 20],
  ])("%f liters -> %i", (liters, expected) => {
    expect(hydrationScore(liters)).toBe(expected);
  });
});

describe("subjectiveLevelScore", () => {
  it.each([
    [1, 20],
    [2, 40],
    [3, 60],
    [4, 80],
    [5, 100],
  ])("level %i -> %i", (level, expected) => {
    expect(subjectiveLevelScore(level)).toBe(expected);
  });
});

describe("intensityScore", () => {
  it("defaults to 100 when no RPE data exists -- never penalizes skipping the field", () => {
    expect(intensityScore(null)).toBe(100);
  });

  it.each([
    [6, 100],
    [10, 20],
  ])("avg RPE %i -> %i", (rpe, expected) => {
    expect(intensityScore(rpe)).toBe(expected);
  });
});

describe("streakScore", () => {
  it.each([
    [0, 40],
    [14, 100],
    [30, 100],
  ])("streak %i -> %i", (streak, expected) => {
    expect(streakScore(streak)).toBe(expected);
  });
});

describe("computeRecoveryScore", () => {
  it("scores 100 for an all-max day", () => {
    const { score, breakdown } = computeRecoveryScore({
      sleepHours: 8,
      waterIntakeLiters: 3,
      energyLevel: 5,
      sorenessLevel: 5,
      stressLevel: 5,
      moodLevel: 5,
      avgRpe: null,
      currentStreak: 14,
    });
    expect(score).toBe(100);
    expect(breakdown.sleep).toBe(100);
    expect(breakdown.streak).toBe(100);
  });

  it("scores low for an all-min day with high RPE and no streak", () => {
    const { score } = computeRecoveryScore({
      sleepHours: 0,
      waterIntakeLiters: 0,
      energyLevel: 1,
      sorenessLevel: 1,
      stressLevel: 1,
      moodLevel: 1,
      avgRpe: 10,
      currentStreak: 0,
    });
    expect(score).toBeLessThan(20);
  });

  it("never blocks a check-in from missing RPE data by scoring it worse than an equivalent day with RPE", () => {
    const withoutRpe = computeRecoveryScore({
      sleepHours: 7,
      waterIntakeLiters: 2.5,
      energyLevel: 4,
      sorenessLevel: 4,
      stressLevel: 4,
      moodLevel: 4,
      avgRpe: null,
      currentStreak: 5,
    });
    const withLowRpe = computeRecoveryScore({
      sleepHours: 7,
      waterIntakeLiters: 2.5,
      energyLevel: 4,
      sorenessLevel: 4,
      stressLevel: 4,
      moodLevel: 4,
      avgRpe: 5,
      currentStreak: 5,
    });
    expect(withoutRpe.score).toBe(withLowRpe.score);
  });
});

describe("suggestedRecoveryAction", () => {
  it.each([
    [10, "rest"],
    [50, "hydrated"],
    [70, "normal"],
    [95, "push"],
  ])("score %i mentions the right guidance", (score, keyword) => {
    expect(suggestedRecoveryAction(score).toLowerCase()).toContain(keyword);
  });
});
