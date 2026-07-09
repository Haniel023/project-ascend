// Ascending tier table -- floor is 0.9x (a slight reduction, never a harsh cut) so a
// bad recovery day is discouraged but never blocks meaningful progress.
const TIERS: [maxScore: number, multiplier: number][] = [
  [39, 0.9],
  [59, 0.95],
  [79, 1.0],
  [89, 1.05],
];

export function recoveryXpMultiplier(score: number): number {
  for (const [maxScore, multiplier] of TIERS) {
    if (score <= maxScore) return multiplier;
  }
  return 1.1; // 90+
}
