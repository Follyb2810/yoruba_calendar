"use client";
import React, { useMemo, useState } from "react";

/**
 * Next.js-ready React component implementing a Yoruba (Kọ́jọ́dá) calendar view.
 * Drop into a Next.js App Router page (e.g. app/page.tsx) or a classic pages route.
 * Styling uses Tailwind CSS classes (no import required if your project already
 * has Tailwind configured).
 *
 * Features implemented:
 * - Yoruba year computation (Yoruba year starts on June 3).
 * - Orisa 4-day cycle (Day 1 = Obatala) anchored at June 3.
 * - 7-day business week shown alongside option to view 4-day cycle.
 * - Festivals/events listed with Gregorian date ranges and highlighted on the calendar.
 * - Month navigation and "Today" shortcut.
 *
 * Notes / assumptions:
 * - Historical offset: based on user-supplied references (1958 -> 10000; 2014 -> 10056)
 *   we compute a constant offset of 8042 to map Gregorian year -> Yoruba year.
 * - Yoruba day-of-cycle anchored to June 3 being Day 1 (Obatala). This is a
 *   reasonable convention given the material. If you want a different anchor
 *   we can change it easily.
 */

// ---------- Festival data (Gregorian ranges) ----------
// Each festival is expressed using { start: { m, d }, end: { m, d } }
// where m is 1-based month (1 = January). Ranges are inclusive.
const FESTIVALS = [
  {
    id: "olokun",
    title: "Olokún (Sea & sailors)",
    start: { m: 2, d: 21 },
    end: { m: 2, d: 25 },
  },
  {
    id: "men_rites",
    title: "Rites of passage (men)",
    start: { m: 3, d: 12 },
    end: { m: 3, d: 28 },
  },
  {
    id: "oduduwa",
    title: "Oduduwa (Earth)",
    start: { m: 3, d: 15 },
    end: { m: 3, d: 19 },
  },
  {
    id: "oshosi",
    title: "Oshosi (Hunt)",
    start: { m: 3, d: 21 },
    end: { m: 3, d: 24 },
  },
  {
    id: "ogun_mar",
    title: "Ogun (Metal & craft)",
    start: { m: 3, d: 21 },
    end: { m: 3, d: 24 },
  },
  {
    id: "oshun",
    title: "Oshun (Fertility)",
    start: { m: 4, d: 24 },
    end: { m: 4, d: 30 },
  }, // approximate: Igbe starts last Sat of Apr ~ we approximate
  {
    id: "egungun",
    title: "Egungun (Ancestors)",
    start: { m: 5, d: 25 },
    end: { m: 6, d: 1 },
  },
  {
    id: "yoruba_new_year",
    title: "Yoruba New Year (Okudu 3)",
    start: { m: 6, d: 3 },
    end: { m: 6, d: 3 },
  },
  {
    id: "shopona",
    title: "Shopona & Osanyin",
    start: { m: 6, d: 7 },
    end: { m: 6, d: 8 },
  },
  {
    id: "women_rites",
    title: "Rites of passage (women)",
    start: { m: 6, d: 10 },
    end: { m: 6, d: 23 },
  },
  {
    id: "yemoja",
    title: "Yemoja (Matriarch)",
    start: { m: 6, d: 18 },
    end: { m: 6, d: 21 },
  },
  {
    id: "ifa_mass",
    title: "Ọrúnmilà / Ifá gatherings",
    start: { m: 7, d: 1 },
    end: { m: 7, d: 14 },
  },
  {
    id: "elegba",
    title: "Ẹlégba / Eṣu",
    start: { m: 7, d: 12 },
    end: { m: 7, d: 14 },
  },
  {
    id: "sango",
    title: "Ṣàngo (Thunder)",
    start: { m: 7, d: 15 },
    end: { m: 7, d: 21 },
  },
  {
    id: "ogun_aug",
    title: "Ogun (August weekend)",
    start: { m: 8, d: 25 },
    end: { m: 8, d: 31 },
  },
  {
    id: "oya_osun",
    title: "Oya / Ọwaro Osun (Ijebu)",
    start: { m: 10, d: 15 },
    end: { m: 10, d: 21 },
  },
  {
    id: "shigidi",
    title: "Shigidi (Òrún-Apadi)",
    start: { m: 10, d: 30 },
    end: { m: 10, d: 30 },
  },
  {
    id: "obajulaiye",
    title: "Obajulaiye (Commerce)",
    start: { m: 12, d: 15 },
    end: { m: 12, d: 15 },
  },
];

// ---------- Constants & helpers ----------
const YORUBA_YEAR_OFFSET = 8042; // offset derived from provided references
const ORISA_NAMES = ["Obatala", "Orunmila", "Ogun", "Sango"]; // Day 1..4 anchor

function toKeyDate(year: number, m: number, d: number) {
  // Create Date at local midnight for the given year/month/day (m is 1-based)
  return new Date(year, m - 1, d, 0, 0, 0, 0);
}

function inRange(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

function festivalInstancesForGregorianYear(gregYear: number) {
  // Some festivals span year boundary (e.g., egungun ends June 1) — create instances
  return FESTIVALS.flatMap((f) => {
    const start = toKeyDate(gregYear, f.start.m, f.start.d);
    const end = toKeyDate(gregYear, f.end.m, f.end.d);
    // if end < start (shouldn't happen in our set) we'd add next-year
    if (end.getTime() >= start.getTime()) return [{ ...f, start, end }];
    // otherwise it crosses year boundary
    return [
      { ...f, start: start, end: toKeyDate(gregYear, 12, 31) },
      { ...f, start: toKeyDate(gregYear + 1, 1, 1), end: end },
    ];
  });
}

// ---------- Core Yoruba date logic ----------

/**
 * Get Yoruba year for a given Gregorian date.
 * Yoruba year starts on June 3 of the Gregorian calendar.
 */
function getYorubaYear(date: Date) {
  const y = date.getFullYear();
  const newYearThisGreg = toKeyDate(y, 6, 3);
  let yorubaYear = y + YORUBA_YEAR_OFFSET;
  if (date.getTime() < newYearThisGreg.getTime()) {
    // date belongs to the previous Yoruba year
    yorubaYear = y - 1 + YORUBA_YEAR_OFFSET;
  }
  return yorubaYear;
}

/**
 * Day-in-4-cycle (1..4) anchored so that June 3 is Day 1 (Obatala).
 */
function getOrisaDayIndex(date: Date) {
  // Find the most recent Yoruba New Year (June 3) at or before the date
  const y = date.getFullYear();
  let start = toKeyDate(y, 6, 3);
  if (date.getTime() < start.getTime()) start = toKeyDate(y - 1, 6, 3);
  const daysSince = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  // Day 0 corresponds to June 3 (we want Day 1)
  const idx = ((daysSince % 4) + 4) % 4; // 0..3
  return idx + 1; // 1..4
}

function getOrisaNameForDate(date: Date) {
  const idx = getOrisaDayIndex(date) - 1; // 0-based
  return ORISA_NAMES[idx];
}

function getBusinessWeekDayName(date: Date) {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][date.getDay()];
}

// ---------- Calendar UI helpers ----------
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

// ---------- React component ----------
export default function YorubaCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [showFourDayCycle, setShowFourDayCycle] = useState(true);

  const festivals = useMemo(() => {
    // include festival instances for the cursor's year and adjacent years to cover views
    const y = cursor.getFullYear();
    return [
      ...festivalInstancesForGregorianYear(y - 1),
      ...festivalInstancesForGregorianYear(y),
      ...festivalInstancesForGregorianYear(y + 1),
    ];
  }, [cursor]);

  const grid = useMemo(() => {
    const start = startOfMonth(cursor);
    const dim = daysInMonth(start);
    const firstWeekday = start.getDay(); // 0..6 (Sun..Sat)
    const cells: { date: Date; festivals: any[] }[] = [];

    // Fill leading blanks (for a calendar grid that starts on Sunday)
    for (let i = 0; i < firstWeekday; i++) cells.push(null as any);

    for (let d = 1; d <= dim; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), d);
      const dayFests = festivals.filter((f) => inRange(date, f.start, f.end));
      cells.push({ date, festivals: dayFests });
    }

    // pad trailing cells to complete weeks
    while (cells.length % 7 !== 0) cells.push(null as any);
    return cells;
  }, [cursor, festivals]);

  function gotoPrevMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }
  function gotoNextMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }
  function gotoToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Kọ́jọ́dá — Yoruba Calendar</h1>
          <p className="text-sm text-gray-600">
            Yoruba year starts June 3 • Toggle Orisa 4-day cycle
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button className="px-3 py-1 rounded border" onClick={gotoPrevMonth}>
            Prev
          </button>
          <button className="px-3 py-1 rounded border" onClick={gotoToday}>
            Today
          </button>
          <button className="px-3 py-1 rounded border" onClick={gotoNextMonth}>
            Next
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            Viewing:{" "}
            <strong>
              {cursor.toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </strong>
          </div>
          <div className="text-sm">
            Yoruba Year: <strong>{getYorubaYear(cursor)}</strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showFourDayCycle}
              onChange={() => setShowFourDayCycle((v) => !v)}
            />
            Show 4-day Orisa cycle
          </label>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 bg-white rounded shadow overflow-hidden">
        {/* Weekday headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
          <div
            key={wd}
            className="py-2 text-center font-medium bg-gray-50 border-b"
          >
            {wd}
          </div>
        ))}

        {/* Calendar cells */}
        {grid.map((cell, i) => {
          if (!cell)
            return (
              <div key={i} className="p-2 border min-h-[90px] bg-gray-50" />
            );
          const { date, festivals } = cell;
          const isToday = date.toDateString() === today.toDateString();
          const orisaName = getOrisaNameForDate(date);
          const businessName = getBusinessWeekDayName(date);

          return (
            <div
              key={i}
              className={`p-2 border min-h-[90px] ${
                isToday ? "bg-yellow-50" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium">{date.getDate()}</div>
                <div className="text-xs text-gray-500">{businessName}</div>
              </div>

              <div className="mt-1 text-xs">
                {showFourDayCycle ? (
                  <div className="text-[11px]">
                    Orisa: <strong>{orisaName}</strong>
                  </div>
                ) : (
                  <div className="text-[11px]">
                    Orisa (calc): <strong>{orisaName}</strong>
                  </div>
                )}
              </div>

              <div className="mt-2 space-y-1">
                {festivals.slice(0, 2).map((f) => (
                  <div
                    key={f.id}
                    className="text-[12px] px-1 py-0.5 rounded border-l-4 border-indigo-300 bg-indigo-50"
                  >
                    {f.title}
                  </div>
                ))}
                {festivals.length > 2 && (
                  <div className="text-[11px] text-gray-500">
                    +{festivals.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Legend & Quick Info</h2>
        <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
          <li>Yoruba year begins on June 3 and runs to June 2.</li>
          <li>
            Date to Yoruba-year mapping uses offset{" "}
            <code>{YORUBA_YEAR_OFFSET}</code>. Example: Gregorian 2014 → Yoruba{" "}
            {2014 + YORUBA_YEAR_OFFSET} (per supplied references).
          </li>
          <li>
            The 4-day Orisa cycle is calculated relative to the Yoruba New Year
            (June 3 = Obatala / Day 1).
          </li>
        </ul>

        <div className="mt-4">
          <h3 className="font-medium">Upcoming festivals this month</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            {festivals
              .filter((f) =>
                inRange(
                  new Date(cursor.getFullYear(), cursor.getMonth(), 15),
                  f.start,
                  f.end
                )
              )
              .map((f) => (
                <div key={f.id} className="p-3 border rounded">
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-gray-600">
                    {f.start.toDateString()} — {f.end.toDateString()}
                  </div>
                </div>
              ))}
            {festivals.filter((f) =>
              inRange(
                new Date(cursor.getFullYear(), cursor.getMonth(), 15),
                f.start,
                f.end
              )
            ).length === 0 && (
              <div className="text-sm text-gray-600">
                No major festivals listed for this month in our dataset.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
