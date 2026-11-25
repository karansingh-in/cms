// Day boundary at 03:00 local: a 1am session belongs to the day you are living.
// Borrowed from Haven because every total, streak and countdown depends on it.
export const DAY_START_HOUR = 3;

/** Local "YYYY-MM-DD" for the study day containing `now`. */
export function studyDay(now: Date = new Date(), tz = TZ): string {
  const shifted = new Date(now.getTime() - DAY_START_HOUR * 3600_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(shifted);
}

/** Whole days from today's study day to `date` ("YYYY-MM-DD"). Negative once past. */
export function daysUntil(date: string, now: Date = new Date()): number {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${studyDay(now)}T00:00:00Z`)) / 86_400_000);
}

export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : `${m}m`;
}

export function isToday(date: string, now: Date = new Date()): boolean {
  return date === studyDay(now);
}

export function localHour(now: Date = new Date(), tz = TZ): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "numeric", hour12: false }).format(now));
}

/** Weekday + day + month for a plain calendar date, no timezone drift. */
export function dayLabel(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

export function greeting(now: Date = new Date()): string {
  const h = localHour(now);
  return h < 5 ? "Still up." : h < 12 ? "Good morning." : h < 17 ? "Good afternoon." : "Good evening.";
}

export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const TZ = process.env.APP_TZ ?? "Asia/Kolkata";
