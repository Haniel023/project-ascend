import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";
import { exercises, muscleGroups, planExercises, workoutPlans } from "./fitness.schema";

export const workoutLogs = sqliteTable("workout_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: integer("planId").references(() => workoutPlans.id, { onDelete: "set null" }),
  performedAt: integer("performedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  // 'YYYY-MM-DD' computed server-side from the user's stored timezone. This is the
  // single source of truth for streaks, quest resets, and the XP coverage window --
  // never derive "which day" from performedAt/UTC directly.
  logDate: text("logDate").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const workoutLogExercises = sqliteTable("workout_log_exercise", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workoutLogId: integer("workoutLogId")
    .notNull()
    .references(() => workoutLogs.id, { onDelete: "cascade" }),
  exerciseId: integer("exerciseId")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  planExerciseId: integer("planExerciseId").references(() => planExercises.id, {
    onDelete: "set null",
  }),
  // Denormalized snapshot of the exercise's primary muscle group at log time.
  // Deliberate, unlike plan_exercises (which stays normalized/live): historical
  // XP and coverage data must not shift if an exercise's tag is edited later.
  muscleGroupId: integer("muscleGroupId")
    .notNull()
    .references(() => muscleGroups.id, { onDelete: "restrict" }),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const workoutLogSets = sqliteTable("workout_log_set", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workoutLogExerciseId: integer("workoutLogExerciseId")
    .notNull()
    .references(() => workoutLogExercises.id, { onDelete: "cascade" }),
  setNumber: integer("setNumber").notNull(),
  reps: integer("reps"),
  weightKg: real("weightKg"),
  durationSeconds: integer("durationSeconds"),
  distanceMeters: real("distanceMeters"),
  rpe: integer("rpe"), // 1-10, unused by Phase 1 logic; seeds a future overtraining detector
  completedAt: integer("completedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
