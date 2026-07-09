// Phase 2 tables: achievements/badges and weekly bosses.
import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";
import { planDays } from "./fitness.schema";
import { xpTransactions } from "./gamification.schema";

export const achievements = sqliteTable("achievement", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconKey: text("iconKey").notNull(),
  category: text("category").notNull(),
  // Evaluated by server/game/achievements/achievementDefinitions.ts -- shape depends
  // on `type` (e.g. { type: 'streak', value: 7 }, { type: 'bossDefeats', value: 5 }).
  criteriaJson: text("criteriaJson", { mode: "json" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const userAchievements = sqliteTable(
  "user_achievement",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: integer("achievementId")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: integer("unlockedAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.achievementId)]
);

// One row per (user, week) -- bosses are personal, not shared: each targets one of
// the *player's own* plan days (rotated weekly), so there's no global boss registry
// to join against. Progress lives on the same row rather than a separate table since
// a boss without its owning user never makes sense on its own.
export const weeklyBosses = sqliteTable(
  "weekly_boss",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Kept for convenience/navigation; the day could be renamed or deleted later, so
    // dayNameSnapshot/muscleGroupSlugsSnapshot below are the source of truth for
    // what this specific boss instance actually tracked.
    planDayId: integer("planDayId").references(() => planDays.id, { onDelete: "set null" }),
    dayNameSnapshot: text("dayNameSnapshot").notNull(),
    muscleGroupSlugsSnapshot: text("muscleGroupSlugsSnapshot", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    title: text("title").notNull(),
    weekStartDate: text("weekStartDate").notNull(), // Monday, 'YYYY-MM-DD', in the user's timezone
    requiredSets: integer("requiredSets").notNull(),
    currentProgress: integer("currentProgress").notNull().default(0),
    isDefeated: integer("isDefeated", { mode: "boolean" }).notNull().default(false),
    defeatedAt: integer("defeatedAt", { mode: "timestamp_ms" }),
    rewardXpTransactionId: integer("rewardXpTransactionId").references(() => xpTransactions.id, {
      onDelete: "set null",
    }),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.weekStartDate)]
);
