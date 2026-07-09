-- Redesign weekly bosses as per-user (userId, weekStartDate) rows tied to a plan day,
-- merging what was previously two tables (weekly_boss + weekly_boss_progress) into
-- one. Both tables are brand-new Phase 1 placeholders that have never been populated
-- (no boss feature existed until now), so this is a safe drop-and-recreate.
DROP TABLE IF EXISTS `weekly_boss_progress`;
--> statement-breakpoint
DROP TABLE IF EXISTS `weekly_boss`;
--> statement-breakpoint
CREATE TABLE `weekly_boss` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`planDayId` integer,
	`dayNameSnapshot` text NOT NULL,
	`muscleGroupSlugsSnapshot` text NOT NULL,
	`title` text NOT NULL,
	`weekStartDate` text NOT NULL,
	`requiredSets` integer NOT NULL,
	`currentProgress` integer DEFAULT 0 NOT NULL,
	`isDefeated` integer DEFAULT false NOT NULL,
	`defeatedAt` integer,
	`rewardXpTransactionId` integer,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`planDayId`) REFERENCES `plan_day`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`rewardXpTransactionId`) REFERENCES `xp_transaction`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weekly_boss_userId_weekStartDate_unique` ON `weekly_boss` (`userId`,`weekStartDate`);
