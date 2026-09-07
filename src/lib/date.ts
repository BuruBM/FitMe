// Server runtimes (Vercel, etc.) run in UTC, but the app's only user is in
// Argentina (UTC-3). Using `new Date()` + UTC formatting for "today" would
// roll logs over to the next day starting at 21:00 local time — squarely in
// her dinner/evening logging window. Every "what day is it" call in the app
// goes through here instead.
const APP_TIMEZONE = "America/Argentina/Buenos_Aires";

export function todayInAppTz(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIMEZONE }).format(new Date());
}

/** Pure calendar-date arithmetic on a "yyyy-MM-dd" string, timezone-independent. */
export function shiftDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
