import { YORUBA_WEEK_DAYS_SHORT } from "@/constants/mock";
import {
  type CalendarDateParts,
  civilDateParts,
  getCalendarDateParts,
} from "./yorubaCalendar";

export function getBusinessWeekDayName(
  date: Date | Pick<CalendarDateParts, "year" | "month" | "day">
): string {
  const parts =
    date instanceof Date
      ? getCalendarDateParts(date)
      : civilDateParts(date.year, date.month, date.day);

  return YORUBA_WEEK_DAYS_SHORT[parts.weekday];
}
