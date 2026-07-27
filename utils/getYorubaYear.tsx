import {
  YORUBA_YEAR_OFFSET,
  ORISA_NAMES,
} from "@/module/Calendar/calendar.data";
import {
  type CalendarDateParts,
  civilDateParts,
  daysBetweenCivilDates,
  daysInCivilMonth,
  getCalendarDateParts,
} from "./yorubaCalendar";

const ORISA_ANCHOR = { year: 1958, month: 6, day: 3 };
const ORISA_ANCHOR_INDEX = 0;

function resolveParts(
  date: Date | Pick<CalendarDateParts, "year" | "month" | "day">
): CalendarDateParts {
  if (date instanceof Date) {
    return getCalendarDateParts(date);
  }
  return civilDateParts(date.year, date.month, date.day);
}

export function getYorubaYear(
  date: Date | Pick<CalendarDateParts, "year" | "month" | "day">
): number {
  const { year, month, day } = resolveParts(date);
  if (month < 6 || (month === 6 && day < 3)) {
    return year - 1 + YORUBA_YEAR_OFFSET;
  }
  return year + YORUBA_YEAR_OFFSET;
}

/** Yoruba year label for a month view (avoids using day 1 in June). */
export function getYorubaYearForMonthView(
  viewYear: number,
  viewMonth: number,
  today: Pick<CalendarDateParts, "year" | "month" | "day">
): number {
  if (viewYear === today.year && viewMonth === today.month) {
    return getYorubaYear(today);
  }

  if (viewMonth === 6) {
    return getYorubaYear({ year: viewYear, month: 6, day: 3 });
  }

  const dim = daysInCivilMonth(viewYear, viewMonth);
  return getYorubaYear({ year: viewYear, month: viewMonth, day: Math.min(15, dim) });
}

export function getOrisaDayIndex(
  date: Date | Pick<CalendarDateParts, "year" | "month" | "day">
): number {
  const target = resolveParts(date);
  const daysSince = daysBetweenCivilDates(ORISA_ANCHOR, target);

  /*
    June 3, 1958 = Ọ̀ṣẹ̀ Ọbàtálá (Day 1). +1 aligns modern Yoruba years
    so each June 3 opens on Obatala.
  */
  const index =
    (((ORISA_ANCHOR_INDEX + daysSince + 1) % 4) + 4) % 4;
  return index + 1;
}

export function getOrisaNameForDate(
  date: Date | Pick<CalendarDateParts, "year" | "month" | "day">
): string {
  const idx = getOrisaDayIndex(date) - 1;
  return ORISA_NAMES[idx];
}

export function startOfMonth(year: number, month: number) {
  return civilDateParts(year, month, 1);
}

export function daysInMonth(year: number, month: number) {
  return daysInCivilMonth(year, month);
}
