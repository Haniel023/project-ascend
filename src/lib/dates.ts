// Returns 'YYYY-MM-DD' for the given instant, evaluated in the given IANA timezone.
// This is the single source of truth for "which day" a workout/quest counts toward --
// never derive it from raw UTC date math.
export function getLocalDateString(timezone: string, date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
}

// Pure calendar math on an already-resolved 'YYYY-MM-DD' string -- no timezone
// re-interpretation at all (Date.UTC + UTC getters throughout). Use this whenever
// you already have a stored logDate/assignedDate string and need its week-start;
// re-running it through getWeekStartDate(timezone, parseISO(str)) would be wrong
// whenever the server's system timezone differs from the user's stored timezone,
// since that re-resolves the calendar day through Intl a second time and can shift
// it by a day.
export function getWeekStartDateFromDateString(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const utcMs = Date.UTC(year, month - 1, day);
  const dayOfWeek = new Date(utcMs).getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const mondayMs = utcMs - daysSinceMonday * 86_400_000;
  const monday = new Date(mondayMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${monday.getUTCFullYear()}-${pad(monday.getUTCMonth() + 1)}-${pad(monday.getUTCDate())}`;
}

// Returns 'YYYY-MM-DD' for the Monday of the week containing the given instant, in
// the given timezone. Weeks (for weekly bosses) always run Monday-Sunday. Only use
// this for a fresh instant (e.g. "now") -- for an already-resolved date string, use
// getWeekStartDateFromDateString instead.
export function getWeekStartDate(timezone: string, date: Date = new Date()): string {
  return getWeekStartDateFromDateString(getLocalDateString(timezone, date));
}

// 0-23 hour-of-day for the given instant, evaluated in the given IANA timezone.
// Used only for coarse "is it evening yet" nudges -- never for anything date-identity-critical.
export function getLocalHour(timezone: string, date: Date = new Date()): number {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(date));
  return hour % 24; // some environments render midnight as "24" under hour12: false
}
