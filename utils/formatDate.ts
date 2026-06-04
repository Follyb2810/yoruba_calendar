import { MONTH_NAMES, YORUBA_WEEK_DAYS } from "@/constants/mock";

export function formatYorubaDate(date: Date): string {
  const weekDay = YORUBA_WEEK_DAYS[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth()];
  return `${weekDay}, ${date.getDate()} ${monthName} ${date.getFullYear()}`;
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
