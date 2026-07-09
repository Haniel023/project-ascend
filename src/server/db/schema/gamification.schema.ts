import { sqliteTable, text, integer, real, unique } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";
import type { QuestCategory, QuestInstanceStatus, Rank, XpSourceType } from "./enums";

// Append-only ledger. Every XP-granting event writes exactly one row here; totals are
// derived by summing finalXp, never by mutating a row after the fact. Multipliers are
// baked in at write time (see server/game/xp) and are NOT retroactively recalculated
// if a later day changes the trailing coverage window -- this keeps the ledger auditable.
export const xpTransactions = sqliteTable("xp_transaction", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sourceType: text("sourceType").$type<XpSourceType>().notNull(),
  sourceId: integer("sourceId"),
  rawXp: real("rawXp").notNull(),
  diminishingMultiplier: real("diminishingMultiplier").notNull().default(1),
  coverageMultiplier: real("coverageMultiplier").notNull().default(1),
  recoveryMultiplier: real("recoveryMultiplier").notNull().default(1),
  equipmentMultiplier: real("equipmentMultiplier").notNull().default(1),
  finalXp: integer("finalXp").notNull(),
  // JSON array of muscle-group slugs involved, snapshotted for audit purposes.
  muscleGroupsInvolved: text("muscleGroupsInvolved", { mode: "json" }).$type<string[]>(),
  logDate: text("logDate").notNull(),
  occurredAt: integer("occurredAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const questTemplates = sqliteTable("quest_template", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").$type<QuestCategory>().notNull(),
  bonusXp: integer("bonusXp").notNull().default(15),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const dailyQuestInstances = sqliteTable(
  "daily_quest_instance",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questTemplateId: integer("questTemplateId")
      .notNull()
      .references(() => questTemplates.id, { onDelete: "cascade" }),
    assignedDate: text("assignedDate").notNull(),
    status: text("status").$type<QuestInstanceStatus>().notNull().default("pending"),
    completedAt: integer("completedAt", { mode: "timestamp_ms" }),
    xpTransactionId: integer("xpTransactionId").references(() => xpTransactions.id, {
      onDelete: "set null",
    }),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.assignedDate, t.questTemplateId)]
);

export const progressionEvents = sqliteTable("progression_event", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fromRank: text("fromRank").$type<Rank>().notNull(),
  toRank: text("toRank").$type<Rank>().notNull(),
  fromLevel: integer("fromLevel").notNull(),
  toLevel: integer("toLevel").notNull(),
  suggestedChangesJson: text("suggestedChangesJson", { mode: "json" }),
  appliedByUser: integer("appliedByUser", { mode: "boolean" }).notNull().default(false),
  appliedAt: integer("appliedAt", { mode: "timestamp_ms" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
