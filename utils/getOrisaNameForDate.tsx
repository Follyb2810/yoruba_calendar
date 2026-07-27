import { FESTIVALS } from "@/module/Calendar/calendar.data";
import {
  civilDateParts,
  civilDateToDayNumber,
  type CalendarDateParts,
} from "./yorubaCalendar";

/** Stable UTC-noon instant for legacy range checks (civil date, not local TZ). */
export function toKeyDate(year: number, m: number, d: number) {
  return new Date(Date.UTC(year, m - 1, d, 12, 0, 0, 0));
}

export function inRange(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function inRangeCivil(
  target: Pick<CalendarDateParts, "year" | "month" | "day">,
  start: Pick<CalendarDateParts, "year" | "month" | "day">,
  end: Pick<CalendarDateParts, "year" | "month" | "day">
): boolean {
  const t = civilDateToDayNumber(target.year, target.month, target.day);
  const s = civilDateToDayNumber(start.year, start.month, start.day);
  const e = civilDateToDayNumber(end.year, end.month, end.day);
  return t >= s && t <= e;
}

export function festivalInstancesForGregorianYear(gregYear: number) {
  return FESTIVALS.flatMap((f) => {
    const start = civilDateParts(gregYear, f.start.m, f.start.d);
    const end = civilDateParts(gregYear, f.end.m, f.end.d);
    if (
      civilDateToDayNumber(end.year, end.month, end.day) >=
      civilDateToDayNumber(start.year, start.month, start.day)
    ) {
      return [{ ...f, start, end }];
    }
    return [
      { ...f, start, end: civilDateParts(gregYear, 12, 31) },
      { ...f, start: civilDateParts(gregYear + 1, 1, 1), end },
    ];
  });
}
