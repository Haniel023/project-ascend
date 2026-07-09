CREATE TABLE `equipment_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`slot` text NOT NULL,
	`rarity` text NOT NULL,
	`bonusCategory` text NOT NULL,
	`bonusValue` real NOT NULL,
	`loreText` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `equipment_item_slug_unique` ON `equipment_item` (`slug`);--> statement-breakpoint
CREATE TABLE `user_equipment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`itemId` integer NOT NULL,
	`source` text NOT NULL,
	`acquiredAt` integer NOT NULL,
	`isEquipped` integer DEFAULT false NOT NULL,
	`equippedAt` integer,
	`expiresAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`itemId`) REFERENCES `equipment_item`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `xp_transaction` ADD `equipmentMultiplier` real DEFAULT 1 NOT NULL;