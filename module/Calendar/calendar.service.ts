import {
  civilDateParts,
  getWeekdayForCivilDate,
  type CalendarDateParts,
} from "@/utils/yorubaCalendar";
import { daysInMonth } from "@/utils/getYorubaYear";

export function buildMonthGrid(
  viewYear: number,
  viewMonth: number
): (CalendarDateParts | null)[] {
  const dim = daysInMonth(viewYear, viewMonth);
  const firstWeekday = getWeekdayForCivilDate(viewYear, viewMonth, 1);
  const cells: (CalendarDateParts | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);

  for (let d = 1; d <= dim; d++) {
    cells.push(civilDateParts(viewYear, viewMonth, d));
  }

  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}
