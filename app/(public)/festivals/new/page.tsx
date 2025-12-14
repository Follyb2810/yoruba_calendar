"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { TOrisa } from "../../orisha/page";


const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YORUBA_WEEK_DAYS = [
  "Aiku",
  "Aje",
  "Isegun",
  "Ojoru",
  "Ojobo",
  "Eti",
  "Abameta",
];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function formatYorubaDate(day: number, month: number, year: number) {
  const date = new Date(year, month - 1, day);
  const weekDay = YORUBA_WEEK_DAYS[date.getDay()];
  const monthName = MONTH_NAMES[month - 1];
  return `${weekDay}, ${day} ${monthName} ${year}`;
}

export default function NewFestivalPage() {
  const [title, setTitle] = useState("");
  const [orisaId, setOrisaId] = useState<number | null>(null);
  const [orisas, setOrisas] = useState<TOrisa[] | []>([]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const [startYear, setStartYear] = useState(String(currentYear));
  const [startMonth, setStartMonth] = useState(String(currentMonth));
  const [startDay, setStartDay] = useState(String(currentDay));

  const [endYear, setEndYear] = useState(String(currentYear));
  const [endMonth, setEndMonth] = useState(String(currentMonth));
  const [endDay, setEndDay] = useState(String(currentDay));

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/orisha");
      const data = await res.json();
      setOrisas(data);
    })();
  }, []);

  useEffect(() => {
    const maxDays = getDaysInMonth(Number(startMonth), Number(startYear));
    if (Number(startDay) > maxDays) setStartDay(String(maxDays));
  }, [startMonth, startYear]);

  useEffect(() => {
    const maxDays = getDaysInMonth(Number(endMonth), Number(endYear));
    if (Number(endDay) > maxDays) setEndDay(String(maxDays));
  }, [endMonth, endYear]);

  const startDateString = useMemo(
    () =>
      formatYorubaDate(Number(startDay), Number(startMonth), Number(startYear)),
    [startDay, startMonth, startYear]
  );
  const endDateString = useMemo(
    () => formatYorubaDate(Number(endDay), Number(endMonth), Number(endYear)),
    [endDay, endMonth, endYear]
  );

  async function submitFestival() {
    try {
      const res = await fetch("/api/festivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          orisaId,
          startYear: Number(startYear),
          startMonth: Number(startMonth),
          startDay: Number(startDay),
          endYear: Number(endYear),
          endMonth: Number(endMonth),
          endDay: Number(endDay),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error}`);
        return;
      }
      alert(
        `Festival "${title}" created!\nStart: ${startDateString}\nEnd: ${endDateString}`
      );
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating the festival.");
    }
  }

  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const availableStartMonths = Array.from(
    { length: 12 },
    (_, i) => i + 1
  ).filter((m) => Number(startYear) > currentYear || m >= currentMonth);

  const availableEndMonths = Array.from({ length: 12 }, (_, i) => i + 1).filter(
    (m) => Number(endYear) > currentYear || m >= currentMonth
  );

  const getAvailableDays = (year: number, month: number) => {
    const maxDays = getDaysInMonth(month, year);
    if (year === currentYear && month === currentMonth) {
      return Array.from(
        { length: maxDays - currentDay + 1 },
        (_, i) => i + currentDay
      );
    }
    return Array.from({ length: maxDays }, (_, i) => i + 1);
  };

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create Festival</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Festival Name</label>
            <Input
              placeholder="Egungun Festival"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Orisa</label>
            <Select onValueChange={(v) => setOrisaId(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose Orisa" />
              </SelectTrigger>
              <SelectContent>
                {orisas.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Start Date</label>
            <div className="flex gap-2">
              <Select value={startYear} onValueChange={setStartYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableStartMonths.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {MONTH_NAMES[m - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={startDay} onValueChange={setStartDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDays(Number(startYear), Number(startMonth)).map(
                    (d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Selected: {startDateString}
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">End Date</label>
            <div className="flex gap-2">
              <Select value={endYear} onValueChange={setEndYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={endMonth} onValueChange={setEndMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableEndMonths.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {MONTH_NAMES[m - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={endDay} onValueChange={setEndDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDays(Number(endYear), Number(endMonth)).map(
                    (d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Selected: {endDateString}
            </div>
          </div>

          <Button className="w-full" onClick={submitFestival}>
            Create Festival
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
