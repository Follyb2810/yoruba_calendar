import {
  ORISA_NAMES,
  YORUBA_YEAR_OFFSET,
} from "@/app/calendar/_component/mocks";
import { toKeyDate } from "./getOrisaNameForDate";

export function getYorubaYear(date: Date) {
  const newyear = date.getFullYear();
  const newYearThisGreg = toKeyDate(newyear, 6, 3);
  let yorubaYear = newyear + YORUBA_YEAR_OFFSET;
  if (date.getTime() < newYearThisGreg.getTime())
    yorubaYear = newyear - 1 + YORUBA_YEAR_OFFSET;
  return yorubaYear;
}

export function getOrisaDayIndex(date: Date) {
  const newyear = date.getFullYear();
  let newYearThisGreg = toKeyDate(newyear, 6, 3);
  const oneDay = 1000 * 60 * 60 * 24;
  if (date.getTime() < newYearThisGreg.getTime())
    newYearThisGreg = toKeyDate(newyear - 1, 6, 3);
  const daysSince = Math.floor(
    (date.getTime() - newYearThisGreg.getTime()) / oneDay
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
