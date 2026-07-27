import { YORUBA_YEAR_OFFSET } from "@/module/Calendar/calendar.data";
import { YORUBA_CALENDAR_TZ } from "@/utils/yorubaCalendar";

export default function Footer() {
  return (
    <footer className="mt-10 p-4">
      <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
        <li>Yoruba year begins on June 3 and runs to June 2.</li>
        <li>
          Date to Yoruba-year mapping uses offset{" "}
          <code>{YORUBA_YEAR_OFFSET}</code>.
        </li>
        <li>
          The 4-day Orisa cycle is calculated relative to the Yoruba New Year
          (June 3 = Obatala / Day 1).
        </li>
        <li>
          All calendar days use <code>{YORUBA_CALENDAR_TZ}</code> so users
          worldwide see the same sacred day.
        </li>
      </ul>
    </footer>
  );
}
