import { ORISA_NAMES, YORUBA_YEAR_OFFSET } from "@/app/calendar/_component/mocks";
import { toKeyDate } from "./getOrisaNameForDate";

export function getYorubaYear(date: Date) {
  const y = date.getFullYear();
  const newYearThisGreg = toKeyDate(y, 6, 3);
  let yorubaYear = y + YORUBA_YEAR_OFFSET;
  if (date.getTime() < newYearThisGreg.getTime())
    yorubaYear = y - 1 + YORUBA_YEAR_OFFSET;
  return yorubaYear;
}

export function getOrisaDayIndex(date: Date) {
  const y = date.getFullYear();
  let start = toKeyDate(y, 6, 3);
  if (date.getTime() < start.getTime()) start = toKeyDate(y - 1, 6, 3);
  const daysSince = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const idx = ((daysSince % 4) + 4) % 4;
  return idx + 1;
}
export function getOrisaNameForDate(date: Date) {
  const idx = getOrisaDayIndex(date) - 1;
  return ORISA_NAMES[idx];
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
export function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
