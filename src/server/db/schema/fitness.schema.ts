import { sqliteTable, text, integer, real, primaryKey, unique } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";
import type { Equipment, PrimaryGoal, StartingFitnessLevel, TrackingType } from "./enums";

export const profiles = sqliteTable("profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("displayName").notNull(),
  avatarKey: text("avatarKey").notNull().default("default"),
  heightCm: real("heightCm"),
  weightKg: real("weightKg"),
  startingFitnessLevel: text("startingFitnessLevel").$type<StartingFitnessLevel>(),
  // Captured by the interactive character-creation wizard; drives the auto-generated
  // starter plan (server/game/onboarding) and is reused as the analytics baseline.
  primaryGoal: text("primaryGoal").$type<PrimaryGoal>(),
  daysPerWeekTarget: integer("daysPerWeekTarget"),
  availableEquipment: text("availableEquipment", { mode: "json" }).$type<Equipment[]>(),
  onboardingCompletedAt: integer("onboardingCompletedAt", { mode: "timestamp_ms" }),
  timezone: text("timezone").notNull().default("UTC"),
  disclaimerAcceptedAt: integer("disclaimerAcceptedAt", { mode: "timestamp_ms" }),
  // Cached/denormalized for cheap reads; source of truth is the xp_transactions ledger.
  totalXp: integer("totalXp").notNull().default(0),
  currentLevel: integer("currentLevel").notNull().default(1),
  currentStreak: integer("currentStreak").notNull().default(0),
  longestStreak: integer("longestStreak").notNull().default(0),
  lastActivityDate: text("lastActivityDate"), // 'YYYY-MM-DD' in the user's timezone
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Fixed, seeded, small list. Not user-editable.
export const muscleGroups = sqliteTable("muscle_group", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  sortOrder: integer("sortOrder").notNull().default(0),
});

export const exercises = sqliteTable("exercise", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  equipment: text("equipment").$type<Equipment>().notNull(),
  trackingType: text("trackingType").$type<TrackingType>().notNull(),
  isSeeded: integer("isSeeded", { mode: "boolean" }).notNull().default(false),
  // null = system catalog (visible to everyone); set = private custom exercise,
  // only ever shown to its own creator.
  createdByUserId: text("createdByUserId").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Join table (not a JSON array) so muscle-group coverage can be aggregated with real SQL.
export const exerciseMuscleGroups = sqliteTable(
  "exercise_muscle_group",
  {
    exerciseId: integer("exerciseId")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    muscleGroupId: integer("muscleGroupId")
      .notNull()
      .references(() => muscleGroups.id, { onDelete: "cascade" }),
    isPrimary: integer("isPrimary", { mode: "boolean" }).notNull().default(true),
  },
  (t) => [primaryKey({ columns: [t.exerciseId, t.muscleGroupId] })]
);

export const workoutPlans = sqliteTable("workout_plan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// A named, unordered-in-time slot within a plan (e.g. "Push", "Pull", "Legs"). Not
// tied to calendar weekdays -- the player picks which day they're doing each time
// they log, so missing a day never puts the split "behind schedule".
export const planDays = sqliteTable(
  "plan_day",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    planId: integer("planId")
      .notNull()
      .references(() => workoutPlans.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sortOrder").notNull().default(0),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.planId, t.name)]
);

export const planExercises = sqliteTable("plan_exercise", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("planId")
    .notNull()
    .references(() => workoutPlans.id, { onDelete: "cascade" }),
  exerciseId: integer("exerciseId")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  // Null = unassigned to any day (shown regardless of which day is picked when
  // logging). Deleting a day sets this back to null rather than deleting the
  // exercise, so a split reorganization never silently loses plan data.
  planDayId: integer("planDayId").references(() => planDays.id, { onDelete: "set null" }),
  targetSets: integer("targetSets").notNull().default(3),
  targetRepsMin: integer("targetRepsMin"),
  targetRepsMax: integer("targetRepsMax"),
  targetWeightKg: real("targetWeightKg"),
  targetDurationSeconds: integer("targetDurationSeconds"),
  sortOrder: integer("sortOrder").notNull().default(0),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
