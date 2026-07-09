import { relations } from "drizzle-orm";
import { accounts, sessions, users } from "./auth.schema";
import {
  exerciseMuscleGroups,
  exercises,
  muscleGroups,
  planDays,
  planExercises,
  profiles,
  workoutPlans,
} from "./fitness.schema";
import { workoutLogExercises, workoutLogs, workoutLogSets } from "./logging.schema";
import {
  dailyQuestInstances,
  progressionEvents,
  questTemplates,
  xpTransactions,
} from "./gamification.schema";
import { achievements, userAchievements, weeklyBosses } from "./phase2.schema";
import { bodyStatEntries, personalRecords } from "./records.schema";
import { recoveryCheckins } from "./recovery.schema";
import { dungeonRuns } from "./dungeons.schema";
import { equipmentItems, userEquipment } from "./equipment.schema";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  accounts: many(accounts),
  sessions: many(sessions),
  workoutPlans: many(workoutPlans),
  workoutLogs: many(workoutLogs),
  xpTransactions: many(xpTransactions),
  dailyQuestInstances: many(dailyQuestInstances),
  progressionEvents: many(progressionEvents),
  customExercises: many(exercises),
  userAchievements: many(userAchievements),
  weeklyBosses: many(weeklyBosses),
  bodyStatEntries: many(bodyStatEntries),
  personalRecords: many(personalRecords),
  recoveryCheckins: many(recoveryCheckins),
  dungeonRuns: many(dungeonRuns),
  userEquipment: many(userEquipment),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const muscleGroupsRelations = relations(muscleGroups, ({ many }) => ({
  exerciseMuscleGroups: many(exerciseMuscleGroups),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  createdBy: one(users, { fields: [exercises.createdByUserId], references: [users.id] }),
  exerciseMuscleGroups: many(exerciseMuscleGroups),
  planExercises: many(planExercises),
}));

export const exerciseMuscleGroupsRelations = relations(exerciseMuscleGroups, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseMuscleGroups.exerciseId],
    references: [exercises.id],
  }),
  muscleGroup: one(muscleGroups, {
    fields: [exerciseMuscleGroups.muscleGroupId],
    references: [muscleGroups.id],
  }),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(users, { fields: [workoutPlans.userId], references: [users.id] }),
  planExercises: many(planExercises),
  days: many(planDays),
  workoutLogs: many(workoutLogs),
}));

export const planDaysRelations = relations(planDays, ({ one, many }) => ({
  plan: one(workoutPlans, { fields: [planDays.planId], references: [workoutPlans.id] }),
  planExercises: many(planExercises),
}));

export const planExercisesRelations = relations(planExercises, ({ one }) => ({
  plan: one(workoutPlans, { fields: [planExercises.planId], references: [workoutPlans.id] }),
  exercise: one(exercises, { fields: [planExercises.exerciseId], references: [exercises.id] }),
  day: one(planDays, { fields: [planExercises.planDayId], references: [planDays.id] }),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one, many }) => ({
  user: one(users, { fields: [workoutLogs.userId], references: [users.id] }),
  plan: one(workoutPlans, { fields: [workoutLogs.planId], references: [workoutPlans.id] }),
  exercises: many(workoutLogExercises),
}));

export const workoutLogExercisesRelations = relations(workoutLogExercises, ({ one, many }) => ({
  workoutLog: one(workoutLogs, {
    fields: [workoutLogExercises.workoutLogId],
    references: [workoutLogs.id],
  }),
  exercise: one(exercises, {
    fields: [workoutLogExercises.exerciseId],
    references: [exercises.id],
  }),
  planExercise: one(planExercises, {
    fields: [workoutLogExercises.planExerciseId],
    references: [planExercises.id],
  }),
  muscleGroup: one(muscleGroups, {
    fields: [workoutLogExercises.muscleGroupId],
    references: [muscleGroups.id],
  }),
  sets: many(workoutLogSets),
}));

export const workoutLogSetsRelations = relations(workoutLogSets, ({ one }) => ({
  workoutLogExercise: one(workoutLogExercises, {
    fields: [workoutLogSets.workoutLogExerciseId],
    references: [workoutLogExercises.id],
  }),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, { fields: [xpTransactions.userId], references: [users.id] }),
}));

export const questTemplatesRelations = relations(questTemplates, ({ many }) => ({
  instances: many(dailyQuestInstances),
}));

export const dailyQuestInstancesRelations = relations(dailyQuestInstances, ({ one }) => ({
  user: one(users, { fields: [dailyQuestInstances.userId], references: [users.id] }),
  questTemplate: one(questTemplates, {
    fields: [dailyQuestInstances.questTemplateId],
    references: [questTemplates.id],
  }),
  xpTransaction: one(xpTransactions, {
    fields: [dailyQuestInstances.xpTransactionId],
    references: [xpTransactions.id],
  }),
}));

export const progressionEventsRelations = relations(progressionEvents, ({ one }) => ({
  user: one(users, { fields: [progressionEvents.userId], references: [users.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const weeklyBossesRelations = relations(weeklyBosses, ({ one }) => ({
  user: one(users, { fields: [weeklyBosses.userId], references: [users.id] }),
  planDay: one(planDays, { fields: [weeklyBosses.planDayId], references: [planDays.id] }),
  rewardXpTransaction: one(xpTransactions, {
    fields: [weeklyBosses.rewardXpTransactionId],
    references: [xpTransactions.id],
  }),
}));

export const bodyStatEntriesRelations = relations(bodyStatEntries, ({ one }) => ({
  user: one(users, { fields: [bodyStatEntries.userId], references: [users.id] }),
}));

export const personalRecordsRelations = relations(personalRecords, ({ one }) => ({
  user: one(users, { fields: [personalRecords.userId], references: [users.id] }),
  exercise: one(exercises, { fields: [personalRecords.exerciseId], references: [exercises.id] }),
  workoutLogSet: one(workoutLogSets, {
    fields: [personalRecords.workoutLogSetId],
    references: [workoutLogSets.id],
  }),
}));

export const recoveryCheckinsRelations = relations(recoveryCheckins, ({ one }) => ({
  user: one(users, { fields: [recoveryCheckins.userId], references: [users.id] }),
}));

export const dungeonRunsRelations = relations(dungeonRuns, ({ one }) => ({
  user: one(users, { fields: [dungeonRuns.userId], references: [users.id] }),
  plan: one(workoutPlans, { fields: [dungeonRuns.planId], references: [workoutPlans.id] }),
  planDay: one(planDays, { fields: [dungeonRuns.planDayId], references: [planDays.id] }),
  questInstance: one(dailyQuestInstances, {
    fields: [dungeonRuns.questInstanceId],
    references: [dailyQuestInstances.id],
  }),
  workoutLog: one(workoutLogs, { fields: [dungeonRuns.workoutLogId], references: [workoutLogs.id] }),
}));

export const equipmentItemsRelations = relations(equipmentItems, ({ many }) => ({
  userEquipment: many(userEquipment),
}));

export const userEquipmentRelations = relations(userEquipment, ({ one }) => ({
  user: one(users, { fields: [userEquipment.userId], references: [users.id] }),
  item: one(equipmentItems, { fields: [userEquipment.itemId], references: [equipmentItems.id] }),
}));
