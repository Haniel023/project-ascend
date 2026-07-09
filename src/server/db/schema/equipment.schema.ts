import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";
import type { EquipmentBonusCategory, EquipmentRarity, EquipmentSlot, EquipmentSource } from "./enums";

// Fixed, seeded catalog -- 30 items (6 slots x 5 rarities). Not user-editable. See
// src/server/db/seed/data/equipmentItems.ts for the actual data.
export const equipmentItems = sqliteTable("equipment_item", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  slot: text("slot").$type<EquipmentSlot>().notNull(),
  rarity: text("rarity").$type<EquipmentRarity>().notNull(),
  // Percentage bonuses (workout_xp/quest_xp/boss_damage) are stored as a decimal
  // fraction (0.02 = +2%); recovery_score is a flat point value added pre-clamp.
  bonusCategory: text("bonusCategory").$type<EquipmentBonusCategory>().notNull(),
  bonusValue: real("bonusValue").notNull(),
  loreText: text("loreText").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// One row per owned copy. Loot always lands here unequipped; equipping is a separate
// deliberate action (equipmentService.ts). "Fully temporary" model: equipping a
// non-Mythic item sets expiresAt = now + 7 days; if it's still equipped once that
// passes, the row is deleted (consumed) lazily the next time bonuses are resolved --
// no cron needed. Mythic items get expiresAt = null and never expire once equipped.
// Unequipping before expiry is always safe and just clears the equip state.
export const userEquipment = sqliteTable("user_equipment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  itemId: integer("itemId")
    .notNull()
    .references(() => equipmentItems.id, { onDelete: "cascade" }),
  source: text("source").$type<EquipmentSource>().notNull(),
  acquiredAt: integer("acquiredAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  isEquipped: integer("isEquipped", { mode: "boolean" }).notNull().default(false),
  equippedAt: integer("equippedAt", { mode: "timestamp_ms" }),
  expiresAt: integer("expiresAt", { mode: "timestamp_ms" }),
});
