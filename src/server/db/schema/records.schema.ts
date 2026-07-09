// Phase 0 quality-of-life additions: body-stat trend history and cached personal
// records. Both are read-mostly extensions of data that's either already captured
// once (profiles.heightCm/weightKg) or fully derivable from existing tables
// (workout_log_sets already has weight/reps for every set ever logged).
import { sqliteTable, text, integer, real, unique } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";
import { exercises } from "./fitness.schema";
import { workoutLogSets } from "./logging.schema";

// One row per user per day, same shape as workout_log/daily_quest_instance's
// "logDate" pattern. profiles.heightCm/weightKg remain the cached "current" values
// (same denormalization already used for totalXp/currentLevel) -- this table is the
// trend history feeding BodyStatsChart.
export const bodyStatEntries = sqliteTable(
  "body_stat_entry",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    recordedDate: text("recordedDate").notNull(), // 'YYYY-MM-DD'
    heightCm: real("heightCm"),
    weightKg: real("weightKg").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.recordedDate)]
);

// Cached best-ever set per (user, exercise) for reps_weight exercises -- avoids
// recomputing a MAX() scan over all-time workout_log_sets on every dashboard/progress
// page load, and gives logWorkoutAction a cheap "did this set just beat the record?"
// check right after insert. estimatedOneRepMax uses the Epley formula:
// weight * (1 + reps / 30).
export const personalRecords = sqliteTable(
  "personal_record",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    exerciseId: integer("exerciseId").notNull().references(() => exercises.id, { onDelete: "cascade" }),
    bestWeightKg: real("bestWeightKg").notNull(),
    bestReps: integer("bestReps").notNull(),
    bestEstimated1Rm: real("bestEstimated1Rm").notNull(),
    achievedAt: integer("achievedAt", { mode: "timestamp_ms" }).notNull(),
    workoutLogSetId: integer("workoutLogSetId").references(() => workoutLogSets.id, { onDelete: "set null" }),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.exerciseId)]
);
