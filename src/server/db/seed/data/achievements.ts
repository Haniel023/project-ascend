import type { AchievementCriteria } from "@/server/game/achievements/achievementDefinitions";

export type AchievementSeed = {
  slug: string;
  title: string;
  description: string;
  iconKey: string;
  category: "streak" | "level" | "workouts" | "boss" | "balance";
  criteria: AchievementCriteria;
};

export const achievementSeed: AchievementSeed[] = [
  // Streak
  { slug: "streak-7", title: "Consistent", description: "Reach a 7-day streak.", iconKey: "flame", category: "streak", criteria: { type: "streak", value: 7 } },
  { slug: "streak-30", title: "Dedicated", description: "Reach a 30-day streak.", iconKey: "flame", category: "streak", criteria: { type: "streak", value: 30 } },
  { slug: "streak-100", title: "Unbreakable", description: "Reach a 100-day streak.", iconKey: "flame", category: "streak", criteria: { type: "streak", value: 100 } },

  // Level / Rank
  { slug: "level-6", title: "Adept Awakened", description: "Reach Adept rank (level 6).", iconKey: "sword", category: "level", criteria: { type: "level", value: 6 } },
  { slug: "level-13", title: "Warrior's Path", description: "Reach Warrior rank (level 13).", iconKey: "flame", category: "level", criteria: { type: "level", value: 13 } },
  { slug: "level-23", title: "Champion's Mantle", description: "Reach Champion rank (level 23).", iconKey: "crown", category: "level", criteria: { type: "level", value: 23 } },
  { slug: "level-36", title: "Legendary", description: "Reach Legend rank (level 36).", iconKey: "sparkles", category: "level", criteria: { type: "level", value: 36 } },

  // Workout volume
  { slug: "workouts-1", title: "First Steps", description: "Log your first workout.", iconKey: "dumbbell", category: "workouts", criteria: { type: "totalWorkouts", value: 1 } },
  { slug: "workouts-25", title: "Regular", description: "Log 25 workouts.", iconKey: "dumbbell", category: "workouts", criteria: { type: "totalWorkouts", value: 25 } },
  { slug: "workouts-100", title: "Centurion", description: "Log 100 workouts.", iconKey: "dumbbell", category: "workouts", criteria: { type: "totalWorkouts", value: 100 } },

  // Weekly bosses
  { slug: "boss-1", title: "First Blood", description: "Defeat your first weekly boss.", iconKey: "shield", category: "boss", criteria: { type: "bossDefeats", value: 1 } },
  { slug: "boss-5", title: "Boss Slayer", description: "Defeat 5 weekly bosses.", iconKey: "shield", category: "boss", criteria: { type: "bossDefeats", value: 5 } },
  { slug: "boss-10", title: "Boss Hunter", description: "Defeat 10 weekly bosses.", iconKey: "shield", category: "boss", criteria: { type: "bossDefeats", value: 10 } },
  { slug: "boss-25", title: "Legendary Slayer", description: "Defeat 25 weekly bosses.", iconKey: "shield", category: "boss", criteria: { type: "bossDefeats", value: 25 } },

  // Balance
  { slug: "balance-8", title: "Well-Rounded", description: "Train all 8 muscle groups within a single week.", iconKey: "sparkles", category: "balance", criteria: { type: "weeklyMuscleGroupCoverage", value: 8 } },
];
