import { YORUBA_YEAR_OFFSET } from "@/app/calendar/_component/mocks";

export default function Footer() {
  return (
    <footer className="mt-10 p-4">
      <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
        <li>Yoruba year begins on June 3 and runs to June 2.</li>
        <li>
          Date to Yoruba-year mapping uses offset Date to Yoruba-year mapping
          uses offset <code>{YORUBA_YEAR_OFFSET}</code>.
        </li>
        <li>
          The 4-day Orisa cycle is calculated relative to the Yoruba New Year
          (June 3 = Obatala / Day 1).
        </li>
      </ul>
    </footer>
  );
}
