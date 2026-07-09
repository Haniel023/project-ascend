CREATE TABLE `plan_day` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`planId` integer NOT NULL,
	`name` text NOT NULL,
	`sortOrder` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`planId`) REFERENCES `workout_plan`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_day_planId_name_unique` ON `plan_day` (`planId`,`name`);--> statement-breakpoint
DROP INDEX `plan_exercise_planId_exerciseId_unique`;--> statement-breakpoint
ALTER TABLE `plan_exercise` ADD `planDayId` integer REFERENCES plan_day(id);