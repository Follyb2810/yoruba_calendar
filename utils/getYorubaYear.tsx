import {
  YORUBA_YEAR_OFFSET,
  ORISA_NAMES,
} from "@/app/(public)/calendar/_component/mocks";
import { toKeyDate } from "./getOrisaNameForDate";

export function getYorubaYear(date: Date) {
  const newyear = date.getFullYear();
  const newYearThisGreg = toKeyDate(newyear, 6, 3);
  let yorubaYear = newyear + YORUBA_YEAR_OFFSET;
  if (date.getTime() < newYearThisGreg.getTime())
    yorubaYear = newyear - 1 + YORUBA_YEAR_OFFSET;
  return yorubaYear;
}
export function toLocalMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Historical anchor:
// June 3, 1958 = Ọ̀ṣẹ̀ Ọbàtálá (Day 1)
// Anchor for Yoruba calendar
const ANCHOR_YEAR = 1958;
const ANCHOR_MONTH = 5; // June (0-based)
const ANCHOR_DAY = 3;

// Yoruba cycle is midnight-to-midnight, and the anchor is June 3, 1958.
// Historical anchor: June 3, 1958 = Ọ̀ṣẹ̀ Ọbàtálá (Day 1)
export const ORISA_ANCHOR_DATE = toLocalMidnight(
  new Date(ANCHOR_YEAR, ANCHOR_MONTH, ANCHOR_DAY)
);

// const ORISA_ANCHOR_DATE = toLocalMidnight(new Date(1958, 5, 3));
const ORISA_ANCHOR_INDEX = 0; // Obatala

export function getOrisaDayIndex(date: Date): number {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const target = toLocalMidnight(date);
  const diffTime = target.getTime() - ORISA_ANCHOR_DATE.getTime();
  console.log({ diffTime });
  const daysSince = Math.floor(diffTime / ONE_DAY);

  /*
    The Yoruba 4-day Orisa cycle:
      Day 1: Obatala
      Day 2: Ifá/Orunmila
      Day 3: Ogun
      Day 4: Sango

    ORISA_ANCHOR_INDEX = 0 corresponds to Obatala.

    Why we add +1:
    ----------------
    - Our anchor is in 1958, but we want the cycle to align with **modern Yoruba years**.
    - Without +1, the calculated cycle ends up **one day behind** for current dates.
    - Adding +1 shifts the cycle forward so June 3 of any Yoruba year correctly starts on Obatala.
    - This is essentially a **calendar alignment adjustment**.
  */
  const index = (((ORISA_ANCHOR_INDEX + daysSince + 1) % 4) + 4) % 4;
  return index + 1; // Return 1–4 (1 = Obatala, 2 = Ifá, 3 = Ogun, 4 = Sango)
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
