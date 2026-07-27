/** Canonical timezone for Yoruba calendar reckoning (same worldwide). */
export const YORUBA_CALENDAR_TZ = "Africa/Lagos";

export type CalendarDateParts = {
  year: number;
  month: number;
  day: number;
  weekday: number;
};

export function getWeekdayForCivilDate(
  year: number,
  month: number,
  day: number
): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** Gregorian civil date in Africa/Lagos for an instant. */
export function getCalendarDateParts(
  instant: Date = new Date()
): CalendarDateParts {
  const iso = instant.toLocaleDateString("en-CA", {
    timeZone: YORUBA_CALENDAR_TZ,
  });
  const [year, month, day] = iso.split("-").map(Number);
  return {
    year,
    month,
    day,
    weekday: getWeekdayForCivilDate(year, month, day),
  };
}

export function civilDateParts(
  year: number,
  month: number,
  day: number
): CalendarDateParts {
  return {
    year,
    month,
    day,
    weekday: getWeekdayForCivilDate(year, month, day),
  };
}

export function civilDateToDayNumber(
  year: number,
  month: number,
  day: number
): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function daysBetweenCivilDates(
  a: Pick<CalendarDateParts, "year" | "month" | "day">,
  b: Pick<CalendarDateParts, "year" | "month" | "day">
): number {
  return (
    civilDateToDayNumber(b.year, b.month, b.day) -
    civilDateToDayNumber(a.year, a.month, a.day)
  );
}

export function isSameCivilDate(
  a: Pick<CalendarDateParts, "year" | "month" | "day">,
  b: Pick<CalendarDateParts, "year" | "month" | "day">
): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function daysInCivilMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function formatCivilDateLabel(
  parts: Pick<CalendarDateParts, "year" | "month" | "day">
): string {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return date.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatMonthYearLabel(year: number, month: number): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}
