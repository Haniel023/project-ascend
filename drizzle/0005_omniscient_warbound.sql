CREATE TABLE `dungeon_run` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`runDate` text NOT NULL,
	`planId` integer,
	`planDayId` integer,
	`dayNameSnapshot` text NOT NULL,
	`title` text NOT NULL,
	`storyText` text NOT NULL,
	`difficulty` text NOT NULL,
	`estimatedXp` integer NOT NULL,
	`includesBossEncounter` integer DEFAULT false NOT NULL,
	`questInstanceId` integer,
	`isCompleted` integer DEFAULT false NOT NULL,
	`completedAt` integer,
	`workoutLogId` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`planId`) REFERENCES `workout_plan`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`planDayId`) REFERENCES `plan_day`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`questInstanceId`) REFERENCES `daily_quest_instance`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`workoutLogId`) REFERENCES `workout_log`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dungeon_run_userId_runDate_unique` ON `dungeon_run` (`userId`,`runDate`);