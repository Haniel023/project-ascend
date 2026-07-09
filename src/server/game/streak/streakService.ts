import { addDays, format, parseISO } from "date-fns";

export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // 'YYYY-MM-DD'
};

// Pure streak transition: called once per calendar day a user logs activity (workout
// or quest). Logging multiple times on the same day is a no-op for streak purposes.
export function computeStreakUpdate(state: StreakState, activityDate: string): StreakState {
  if (state.lastActivityDate === activityDate) {
    return state;
  }

  const isConsecutive =
    state.lastActivityDate != null &&
    format(addDays(parseISO(state.lastActivityDate), 1), "yyyy-MM-dd") === activityDate;

  const currentStreak = isConsecutive ? state.currentStreak + 1 : 1;
  return {
    currentStreak,
    longestStreak: Math.max(state.longestStreak, currentStreak),
    lastActivityDate: activityDate,
  };
}
