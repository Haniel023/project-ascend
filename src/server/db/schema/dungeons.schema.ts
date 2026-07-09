import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";
import { planDays, workoutPlans } from "./fitness.schema";
import { workoutLogs } from "./logging.schema";
import { dailyQuestInstances } from "./gamification.schema";
import type { Rank } from "./enums";

// A generated daily wrapper around the existing logging pipeline -- NOT a parallel
// XP system. "Difficulty"/"estimatedXp"/story flavor are display-only; completing a
// dungeon just means the wrapped workout was logged through the normal
// workout_logs/xp_transactions path (see workoutLog.actions.ts), which is what
// actually determines XP. One dungeon per user per day, generated on first visit.
export const dungeonRuns = sqliteTable(
  "dungeon_run",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    runDate: text("runDate").notNull(), // 'YYYY-MM-DD'
    planId: integer("planId").references(() => workoutPlans.id, { onDelete: "set null" }),
    // Kept for convenience/navigation; the day could be renamed or deleted later, so
    // dayNameSnapshot below is the source of truth for what this run was themed around.
    planDayId: integer("planDayId").references(() => planDays.id, { onDelete: "set null" }),
    dayNameSnapshot: text("dayNameSnapshot").notNull(),
    title: text("title").notNull(),
    storyText: text("storyText").notNull(),
    difficulty: text("difficulty").$type<Rank>().notNull(),
    estimatedXp: integer("estimatedXp").notNull(),
    includesBossEncounter: integer("includesBossEncounter", { mode: "boolean" }).notNull().default(false),
    questInstanceId: integer("questInstanceId").references(() => dailyQuestInstances.id, { onDelete: "set null" }),
    isCompleted: integer("isCompleted", { mode: "boolean" }).notNull().default(false),
    completedAt: integer("completedAt", { mode: "timestamp_ms" }),
    workoutLogId: integer("workoutLogId").references(() => workoutLogs.id, { onDelete: "set null" }),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.runDate)]
);
