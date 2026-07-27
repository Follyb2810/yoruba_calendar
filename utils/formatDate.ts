import { MONTH_NAMES, YORUBA_WEEK_DAYS } from "@/constants/mock";
import { getCalendarDateParts } from "./yorubaCalendar";

export function formatYorubaDate(date: Date): string {
  const parts = getCalendarDateParts(date);
  const weekDay = YORUBA_WEEK_DAYS[parts.weekday];
  const monthName = MONTH_NAMES[parts.month - 1];
  return `${weekDay}, ${parts.day} ${monthName} ${parts.year}`;
}

export function combineDateAndTime(
  dateStr: string,
  timeStr?: string
): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!timeStr) {
    return new Date(year, month - 1, day);
  }
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

export function isFestivalEnded(endDate: Date): boolean {
  return endDate.getTime() < Date.now();
}
