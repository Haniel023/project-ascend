CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`passwordHash` text NOT NULL,
	`sessionVersion` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE TABLE `exercise_muscle_group` (
	`exerciseId` integer NOT NULL,
	`muscleGroupId` integer NOT NULL,
	`isPrimary` integer DEFAULT true NOT NULL,
	PRIMARY KEY(`exerciseId`, `muscleGroupId`),
	FOREIGN KEY (`exerciseId`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`muscleGroupId`) REFERENCES `muscle_group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`equipment` text NOT NULL,
	`trackingType` text NOT NULL,
	`isSeeded` integer DEFAULT false NOT NULL,
	`createdByUserId` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`createdByUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercise_slug_unique` ON `exercise` (`slug`);--> statement-breakpoint
CREATE TABLE `muscle_group` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`label` text NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `muscle_group_slug_unique` ON `muscle_group` (`slug`);--> statement-breakpoint
CREATE TABLE `plan_exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`planId` integer NOT NULL,
	`exerciseId` integer NOT NULL,
	`targetSets` integer DEFAULT 3 NOT NULL,
	`targetRepsMin` integer,
	`targetRepsMax` integer,
	`targetWeightKg` real,
	`targetDurationSeconds` integer,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`planId`) REFERENCES `workout_plan`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_exercise_planId_exerciseId_unique` ON `plan_exercise` (`planId`,`exerciseId`);--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`displayName` text NOT NULL,
	`avatarKey` text DEFAULT 'default' NOT NULL,
	`heightCm` real,
	`weightKg` real,
	`startingFitnessLevel` text,
	`primaryGoal` text,
	`daysPerWeekTarget` integer,
	`availableEquipment` text,
	`onboardingCompletedAt` integer,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`disclaimerAcceptedAt` integer,
	`totalXp` integer DEFAULT 0 NOT NULL,
	`currentLevel` integer DEFAULT 1 NOT NULL,
	`currentStreak` integer DEFAULT 0 NOT NULL,
	`longestStreak` integer DEFAULT 0 NOT NULL,
	`lastActivityDate` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_userId_unique` ON `profile` (`userId`);--> statement-breakpoint
CREATE TABLE `workout_plan` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`isActive` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_log_exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workoutLogId` integer NOT NULL,
	`exerciseId` integer NOT NULL,
	`planExerciseId` integer,
	`muscleGroupId` integer NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`workoutLogId`) REFERENCES `workout_log`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`planExerciseId`) REFERENCES `plan_exercise`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`muscleGroupId`) REFERENCES `muscle_group`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `workout_log_set` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workoutLogExerciseId` integer NOT NULL,
	`setNumber` integer NOT NULL,
	`reps` integer,
	`weightKg` real,
	`durationSeconds` integer,
	`distanceMeters` real,
	`rpe` integer,
	`completedAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`workoutLogExerciseId`) REFERENCES `workout_log_exercise`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`planId` integer,
	`performedAt` integer NOT NULL,
	`logDate` text NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`planId`) REFERENCES `workout_plan`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `daily_quest_instance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`questTemplateId` integer NOT NULL,
	`assignedDate` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`completedAt` integer,
	`xpTransactionId` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`questTemplateId`) REFERENCES `quest_template`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`xpTransactionId`) REFERENCES `xp_transaction`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_quest_instance_userId_assignedDate_questTemplateId_unique` ON `daily_quest_instance` (`userId`,`assignedDate`,`questTemplateId`);--> statement-breakpoint
CREATE TABLE `progression_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`fromRank` text NOT NULL,
	`toRank` text NOT NULL,
	`fromLevel` integer NOT NULL,
	`toLevel` integer NOT NULL,
	`suggestedChangesJson` text,
	`appliedByUser` integer DEFAULT false NOT NULL,
	`appliedAt` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quest_template` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`bonusXp` integer DEFAULT 15 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quest_template_slug_unique` ON `quest_template` (`slug`);--> statement-breakpoint
CREATE TABLE `xp_transaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`sourceType` text NOT NULL,
	`sourceId` integer,
	`rawXp` real NOT NULL,
	`diminishingMultiplier` real DEFAULT 1 NOT NULL,
	`coverageMultiplier` real DEFAULT 1 NOT NULL,
	`finalXp` integer NOT NULL,
	`muscleGroupsInvolved` text,
	`logDate` text NOT NULL,
	`occurredAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `achievement` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`iconKey` text NOT NULL,
	`category` text NOT NULL,
	`criteriaJson` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievement_slug_unique` ON `achievement` (`slug`);--> statement-breakpoint
CREATE TABLE `user_achievement` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`achievementId` integer NOT NULL,
	`unlockedAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`achievementId`) REFERENCES `achievement`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_achievement_userId_achievementId_unique` ON `user_achievement` (`userId`,`achievementId`);--> statement-breakpoint
CREATE TABLE `weekly_boss_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`weeklyBossId` integer NOT NULL,
	`currentProgress` integer DEFAULT 0 NOT NULL,
	`isDefeated` integer DEFAULT false NOT NULL,
	`defeatedAt` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`weeklyBossId`) REFERENCES `weekly_boss`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weekly_boss_progress_userId_weeklyBossId_unique` ON `weekly_boss_progress` (`userId`,`weeklyBossId`);--> statement-breakpoint
CREATE TABLE `weekly_boss` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`muscleGroupFocusId` integer,
	`weekStartDate` text NOT NULL,
	`requiredVolume` integer NOT NULL,
	`rewardAchievementId` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`muscleGroupFocusId`) REFERENCES `muscle_group`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`rewardAchievementId`) REFERENCES `achievement`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weekly_boss_slug_unique` ON `weekly_boss` (`slug`);