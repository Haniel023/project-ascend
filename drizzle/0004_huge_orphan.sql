CREATE TABLE `recovery_checkin` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`checkinDate` text NOT NULL,
	`sleepHours` real NOT NULL,
	`waterIntakeLiters` real NOT NULL,
	`energyLevel` integer NOT NULL,
	`sorenessLevel` integer NOT NULL,
	`stressLevel` integer NOT NULL,
	`moodLevel` integer NOT NULL,
	`recoveryScore` integer NOT NULL,
	`scoreBreakdown` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recovery_checkin_userId_checkinDate_unique` ON `recovery_checkin` (`userId`,`checkinDate`);--> statement-breakpoint
ALTER TABLE `xp_transaction` ADD `recoveryMultiplier` real DEFAULT 1 NOT NULL;