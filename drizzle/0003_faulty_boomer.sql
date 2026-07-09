CREATE TABLE `body_stat_entry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`recordedDate` text NOT NULL,
	`heightCm` real,
	`weightKg` real NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `body_stat_entry_userId_recordedDate_unique` ON `body_stat_entry` (`userId`,`recordedDate`);--> statement-breakpoint
CREATE TABLE `personal_record` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`exerciseId` integer NOT NULL,
	`bestWeightKg` real NOT NULL,
	`bestReps` integer NOT NULL,
	`bestEstimated1Rm` real NOT NULL,
	`achievedAt` integer NOT NULL,
	`workoutLogSetId` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exerciseId`) REFERENCES `exercise`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workoutLogSetId`) REFERENCES `workout_log_set`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `personal_record_userId_exerciseId_unique` ON `personal_record` (`userId`,`exerciseId`);