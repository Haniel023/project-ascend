// Pure recovery-score math -- no framework or DB imports. Every sub-score is 0-100
// where higher always means "more recovered" (soreness/stress sliders are collected
// as 1-5 with 5 = best state, same direction as energy/mood, so they combine uniformly).

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function lerp(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

// Ideal band is 7-9h. Below it falls off toward a 10-point floor (some sleep always
// counts for something); above it falls off more gently (oversleeping is a smaller risk).
export function sleepScore(sleepHours: number): number {
  if (sleepHours >= 7 && sleepHours <= 9) return 100;
  if (sleepHours < 7) return Math.round(lerp(sleepHours, 3, 7, 10, 100));
  return Math.round(lerp(sleepHours, 9, 12, 100, 50));
}

// 2.5L+ is treated as fully hydrated for training purposes.
export function hydrationScore(waterIntakeLiters: number): number {
  if (waterIntakeLiters >= 2.5) return 100;
  return Math.round(lerp(waterIntakeLiters, 0, 2.5, 20, 100));
}

// Shared by energy/soreness/stress/mood -- all four are collected as a 1-5 slider
// where 5 is always the best state, so a single linear mapping covers all of them.
export function subjectiveLevelScore(level: number): number {
  return clamp(Math.round(level), 1, 5) * 20;
}

// Average RPE across the trailing few sessions. No RPE data is common (it's an
// optional field on every set) and must never penalize a user for skipping it.
export function intensityScore(avgRpe: number | null): number {
  if (avgRpe == null) return 100;
  if (avgRpe <= 6) return 100;
  return Math.round(lerp(avgRpe, 6, 10, 100, 20));
}

// Long unbroken streaks reflect sustained consistency, not a mandate to over-train --
// weighted lightly (5%) precisely so it can't dominate the score either direction.
export function streakScore(currentStreak: number): number {
  if (currentStreak <= 0) return 40;
  if (currentStreak >= 14) return 100;
  return Math.round(lerp(currentStreak, 0, 14, 40, 100));
}

export type RecoveryScoreBreakdown = {
  sleep: number;
  hydration: number;
  energy: number;
  soreness: number;
  stress: number;
  mood: number;
  intensity: number;
  streak: number;
};

export type RecoveryScoreInput = {
  sleepHours: number;
  waterIntakeLiters: number;
  energyLevel: number;
  sorenessLevel: number;
  stressLevel: number;
  moodLevel: number;
  avgRpe: number | null;
  currentStreak: number;
};

const WEIGHTS: Record<keyof RecoveryScoreBreakdown, number> = {
  sleep: 0.2,
  hydration: 0.1,
  energy: 0.15,
  soreness: 0.15,
  stress: 0.15,
  mood: 0.1,
  intensity: 0.1,
  streak: 0.05,
};

export function computeRecoveryScore(input: RecoveryScoreInput): { score: number; breakdown: RecoveryScoreBreakdown } {
  const breakdown: RecoveryScoreBreakdown = {
    sleep: sleepScore(input.sleepHours),
    hydration: hydrationScore(input.waterIntakeLiters),
    energy: subjectiveLevelScore(input.energyLevel),
    soreness: subjectiveLevelScore(input.sorenessLevel),
    stress: subjectiveLevelScore(input.stressLevel),
    mood: subjectiveLevelScore(input.moodLevel),
    intensity: intensityScore(input.avgRpe),
    streak: streakScore(input.currentStreak),
  };

  const score = Math.round(
    (Object.keys(WEIGHTS) as (keyof RecoveryScoreBreakdown)[]).reduce(
      (sum, key) => sum + WEIGHTS[key] * breakdown[key],
      0
    )
  );

  return { score: clamp(score, 0, 100), breakdown };
}

export function suggestedRecoveryAction(score: number): string {
  if (score < 40) return "Prioritize rest today -- sleep, hydrate, and consider a lighter session or full rest day.";
  if (score < 60) return "Recovery is below average -- stay hydrated and consider an easier session.";
  if (score < 80) return "Solid recovery -- a normal training session is a good call.";
  return "Fully recovered -- a great day to push intensity.";
}
