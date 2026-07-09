export type AchievementCriteria =
  | { type: "streak"; value: number }
  | { type: "level"; value: number }
  | { type: "totalWorkouts"; value: number }
  | { type: "bossDefeats"; value: number }
  | { type: "weeklyMuscleGroupCoverage"; value: number };

export type AchievementStats = {
  longestStreak: number;
  level: number;
  totalWorkouts: number;
  bossDefeats: number;
  // Best-ever count of distinct muscle groups trained within a single Mon-Sun week.
  maxWeeklyMuscleGroupCoverage: number;
};

export function isAchievementUnlocked(criteria: AchievementCriteria, stats: AchievementStats): boolean {
  switch (criteria.type) {
    case "streak":
      return stats.longestStreak >= criteria.value;
    case "level":
      return stats.level >= criteria.value;
    case "totalWorkouts":
      return stats.totalWorkouts >= criteria.value;
    case "bossDefeats":
      return stats.bossDefeats >= criteria.value;
    case "weeklyMuscleGroupCoverage":
      return stats.maxWeeklyMuscleGroupCoverage >= criteria.value;
  }
}
