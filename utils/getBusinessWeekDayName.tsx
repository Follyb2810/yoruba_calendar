export const BusinessDay = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export function getBusinessWeekDayName(date: Date) {
  return BusinessDay[date.getDay()];
}
