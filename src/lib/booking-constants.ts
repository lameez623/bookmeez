export const TIME_SLOTS = ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"] as const;
export type TimeSlot = (typeof TIME_SLOTS)[number];

/** Monday = 1 ... Thursday = 4 */
export const ALLOWED_WEEKDAYS = [1, 2, 3, 4] as const;

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Local-time YYYY-MM-DD (avoids UTC shifting the date). */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDateLong(key: string): string {
  return fromDateKey(key).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
