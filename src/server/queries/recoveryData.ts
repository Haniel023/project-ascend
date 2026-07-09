import { format, parseISO, subDays } from "date-fns";
import { getRecoveryHistory } from "@/server/game/recovery/recoveryService";
import type { RecoveryTrendPoint } from "@/components/rpg/RecoveryTrendChart";
import { dateRange } from "./dashboardData";

export async function getRecoveryTrend(userId: string, today: string, days: number): Promise<RecoveryTrendPoint[]> {
  const windowStart = format(subDays(parseISO(today), days - 1), "yyyy-MM-dd");
  const checkins = await getRecoveryHistory(userId, windowStart);
  const scoreByDate = new Map(checkins.map((c) => [c.checkinDate, c.recoveryScore]));

  return dateRange(days, today).map((date) => ({ date, score: scoreByDate.get(date) ?? null }));
}
