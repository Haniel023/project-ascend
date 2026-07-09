import { sqliteTable, text, integer, real, unique } from "drizzle-orm/sqlite-core";
import { users } from "./auth.schema";
import type { RecoveryScoreBreakdown } from "@/server/game/recovery/recoveryScore";

// One check-in per user per day, upserted on conflict -- same daily-log shape as
// body_stat_entry/daily_quest_instance. recoveryScore/scoreBreakdown are computed and
// baked in at submit time (see server/game/recovery/recoveryScore.ts), never
// retroactively recalculated -- same audit-trail philosophy as xp_transaction.
export const recoveryCheckins = sqliteTable(
  "recovery_checkin",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    checkinDate: text("checkinDate").notNull(), // 'YYYY-MM-DD'
    sleepHours: real("sleepHours").notNull(),
    waterIntakeLiters: real("waterIntakeLiters").notNull(),
    energyLevel: integer("energyLevel").notNull(), // 1-5
    sorenessLevel: integer("sorenessLevel").notNull(), // 1-5 (1 = very sore, 5 = fresh)
    stressLevel: integer("stressLevel").notNull(), // 1-5 (1 = very stressed, 5 = calm)
    moodLevel: integer("moodLevel").notNull(), // 1-5
    recoveryScore: integer("recoveryScore").notNull(), // 0-100
    scoreBreakdown: text("scoreBreakdown", { mode: "json" }).$type<RecoveryScoreBreakdown>().notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.userId, t.checkinDate)]
);
