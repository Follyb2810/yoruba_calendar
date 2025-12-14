import { FESTIVALS } from "@/app/(public)/calendar/_component/mocks";

export function toKeyDate(year: number, m: number, d: number) {
  return new Date(year, m - 1, d, 0, 0, 0, 0);
}
export function inRange(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}
export function festivalInstancesForGregorianYear(gregYear: number) {
  return FESTIVALS.flatMap((f) => {
    const start = toKeyDate(gregYear, f.start.m, f.start.d);
    const end = toKeyDate(gregYear, f.end.m, f.end.d);
    if (end.getTime() >= start.getTime()) return [{ ...f, start, end }];
    return [
      { ...f, start: start, end: toKeyDate(gregYear, 12, 31) },
      { ...f, start: toKeyDate(gregYear + 1, 1, 1), end: end },
    ];
  });
}
