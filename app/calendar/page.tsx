"use client";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export type IFestive = {
  id: string;
  title: string;
  start: { m: number; d: number };
  end: { m: number; d: number };
};

const ORISA_COLORS: Record<string, string> = {
  Obatala: "bg-white text-black",
  Orunmila: "bg-green-200 text-black",
  Ogun: "bg-green-600 text-white",
  Sango: "bg-red-500 text-white",
  Yemoja: "bg-blue-400 text-white",
  Oshun: "bg-yellow-300 text-black",
  Elegba: "bg-red-800 text-white",
  Oya: "bg-purple-500 text-white",
  Olokun: "bg-blue-900 text-white",
  Egungun:
    "bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 text-black",
  Shopona: "bg-red-700 text-white",
};

function getOrisaColor(orisaName: string) {
  const key = Object.keys(ORISA_COLORS).find((k) => orisaName.includes(k));
  return key ? ORISA_COLORS[key] : "bg-background text-black";
}

const FESTIVALS: IFestive[] = [
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
  },
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
    title: "Ṣàngó (Thunder)",
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

const YORUBA_YEAR_OFFSET = 8042;
const ORISA_NAMES = [
  "Ọ̀ṣẹ̀ Obatala",
  "Ọ̀ṣẹ̀ Ifá/Orunmila",
  "Ọ̀ṣẹ̀ Ogun",
  "Ọ̀ṣẹ̀ Sango",
];
const ORISA_DAILY: Record<number, string[]> = {
  1: [
    "Ọbàtálá/Òrìṣà Ńlá",
    "Yemòó",
    "Èṣù",
    "Egúngún",
    "Ẹgbẹ́-Ọ̀gbà/Alárá-Igbó",
    "Orò",
    "Ẹ̀lúkú",
    " Agẹmọ",
    "Òrìṣà Òkè",
    "Ògìyán/Ògìrìyán",
  ],
  2: ["Ifá/Ọ̀rúnmìlà", "Ọ̀ṣun", "Ọ̀sanyìn", "Yemọja", "Olókun", "Ẹ̀là"],
  3: ["Ògún", "Ìja", "Ọ̀ṣọ́ọ̀sì", "Òrìṣà-Oko", "Erinlẹ̀"],
  4: [
    "Ṣàngó/Jàkúta",
    "Ọya",
    "Baáyànnì",
    "Aganjú",
    "Ọbalúayé/Ṣànpọ̀nná",
    "Nàná-Bùkúù",
  ],
};

function toKeyDate(year: number, m: number, d: number) {
  return new Date(year, m - 1, d, 0, 0, 0, 0);
}
function inRange(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}
function festivalInstancesForGregorianYear(gregYear: number) {
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
function getYorubaYear(date: Date) {
  const y = date.getFullYear();
  const newYearThisGreg = toKeyDate(y, 6, 3);
  let yorubaYear = y + YORUBA_YEAR_OFFSET;
  if (date.getTime() < newYearThisGreg.getTime())
    yorubaYear = y - 1 + YORUBA_YEAR_OFFSET;
  return yorubaYear;
}
function getOrisaDayIndex(date: Date) {
  const y = date.getFullYear();
  let start = toKeyDate(y, 6, 3);
  if (date.getTime() < start.getTime()) start = toKeyDate(y - 1, 6, 3);
  const daysSince = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const idx = ((daysSince % 4) + 4) % 4;
  return idx + 1;
}
function getOrisaNameForDate(date: Date) {
  const idx = getOrisaDayIndex(date) - 1;
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
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export default function Page() {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [showFourDayCycle, setShowFourDayCycle] = useState(true);
  const [orisaModalOpen, setOrisaModalOpen] = useState(false);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const festivals = useMemo(() => {
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
    const firstWeekday = start.getDay();
    const cells: ({ date: Date; festivals: any[] } | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), d);
      const dayFests = festivals.filter((f) => inRange(date, f.start, f.end));
      cells.push({ date, festivals: dayFests });
    }
    while (cells.length % 7 !== 0) cells.push(null);
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
  function openDayModal(day: number) {
    setSelectedDay(day);
    setDayModalOpen(true);
  }

  return (
    <div className="p-6">
      {" "}
      <Card className="rounded-2xl">
        {" "}
        <CardContent>
          {" "}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            {" "}
            <div className="flex-1">
              {" "}
              <h1 className="text-2xl font-semibold">
                Kọ́jọ́dá — Yoruba Calendar{" "}
              </h1>{" "}
              <p className="text-sm text-muted-foreground">
                Yoruba year starts June 3 • Toggle Orisa 4-day cycle{" "}
              </p>{" "}
            </div>{" "}
            <div className="flex flex-wrap gap-2">
              {" "}
              <Button onClick={gotoPrevMonth} variant="ghost">
                Prev
              </Button>{" "}
              <Button onClick={gotoToday} variant="outline">
                Today
              </Button>{" "}
              <Button onClick={gotoNextMonth} variant="ghost">
                Next
              </Button>{" "}
            </div>{" "}
          </header>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
            <div className="flex flex-wrap gap-3 text-sm">
              <div>
                Viewing:{" "}
                <strong>
                  {cursor.toLocaleString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </div>
              <div>
                Yoruba Year: <strong>{getYorubaYear(cursor)}</strong>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Switch
                  checked={showFourDayCycle}
                  onCheckedChange={setShowFourDayCycle}
                />
                <span>Show 4-day Orisa cycle</span>
              </div>
              <Button onClick={() => setOrisaModalOpen(true)} variant="outline">
                Show All Orisa
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-1 bg-card rounded overflow-hidden border text-[10px] sm:text-xs md:text-sm min-w-[600px]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
                <div
                  key={wd}
                  className="py-2 text-center font-semibold text-muted-foreground bg-muted border-b"
                >
                  {wd}
                </div>
              ))}

              {grid.map((cell, i) => {
                if (!cell)
                  return (
                    <div
                      key={i}
                      className="p-2 border min-h-[90px] bg-muted/40"
                    />
                  );
                const { date, festivals } = cell;
                const isToday = date.toDateString() === today.toDateString();
                const orisaName = showFourDayCycle
                  ? getOrisaNameForDate(date)
                  : "";
                let orisaColor = showFourDayCycle
                  ? getOrisaColor(orisaName)
                  : "";
                const [bgClass, textClass] = orisaColor.split(" ");
                const businessName = getBusinessWeekDayName(date);

                return (
                  <div
                    key={i}
                    className={`p-1 sm:p-2 border min-h-[70px] sm:min-h-[90px] ${bgClass} ${textClass} ${
                      isToday ? "border-2 border-black" : ""
                    }`}
                    onClick={() => openDayModal(date.getDate())}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium">
                        {date.getDate()}
                      </div>
                      <div className="text-xs">{businessName}</div>
                    </div>
                    {showFourDayCycle && (
                      <div className="mt-1 text-xs text-[11px] font-semibold">
                        {orisaName}
                      </div>
                    )}
                    <div className="mt-2 space-y-1">
                      {festivals.map((f) => (
                        <div
                          key={f.id}
                          className="text-[12px] px-1 py-0.5 rounded border-l-4 border-primary/60 bg-primary/10"
                        >
                          {f.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Legend & Quick Info</h2>
            <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
              <li>Yoruba year begins on June 3 and runs to June 2.</li>
              <li>
                Date to Yoruba-year mapping uses offset{" "}
                <code>{YORUBA_YEAR_OFFSET}</code>.
              </li>
              <li>
                The 4-day Orisa cycle is calculated relative to the Yoruba New
                Year (June 3 = Obatala / Day 1).
              </li>
            </ul>
          </section>
          <Dialog open={orisaModalOpen} onOpenChange={setOrisaModalOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>All Orisa Names</DialogTitle>
              </DialogHeader>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {ORISA_NAMES.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end">
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dayModalOpen} onOpenChange={setDayModalOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Orisa for Day {selectedDay}</DialogTitle>
              </DialogHeader>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {selectedDay &&
                  (ORISA_DAILY[selectedDay % 4 || 4] || []).map((o) => (
                    <li key={o}>{o}</li>
                  ))}
              </ul>
              <div className="mt-4 flex justify-end">
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
