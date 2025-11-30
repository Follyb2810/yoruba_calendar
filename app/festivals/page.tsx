"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MONTH_NAMES, YORUBA_WEEK_DAYS } from "@/constants/mock";

export interface Orisa {
  id: number;
  name: string;
}

export interface Festival {
  id: number;
  title: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  orisa: Orisa;
}

function formatYorubaDate(day: number, month: number, year: number) {
  const date = new Date(year, month - 1, day);
  const weekDay = YORUBA_WEEK_DAYS[date.getDay()];
  const monthName = MONTH_NAMES[month - 1];
  return `${weekDay}, ${day} ${monthName} ${year}`;
}

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFestivals() {
      try {
        const res = await fetch("/api/festivals?limit=50");
        if (!res.ok) throw new Error("Failed to fetch Festivals");
        const data = await res.json();
        setFestivals(data.festivals);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFestivals();
  }, []);

  if (loading) return <p className="text-center py-10">Loading Festivals...</p>;
  if (error)
    return <p className="text-center py-10 text-red-500">Error: {error}</p>;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Festivals</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {festivals.map((f) => {
          const startDate = formatYorubaDate(
            f.startDay,
            f.startMonth,
            f.startYear
          );
          const endDate = formatYorubaDate(f.endDay, f.endMonth, f.endYear);

          return (
            <Link key={f.id} href={`/festivals/${f.id}`}>
              <section className="block border rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow bg-white">
                <h2 className="text-2xl font-semibold mb-2">{f.title}</h2>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Start:</span> {startDate}
                </p>
                <p className="text-gray-700 mb-3">
                  <span className="font-medium">End:</span> {endDate}
                </p>
                <span className="inline-block bg-yellow-200 text-yellow-800 text-sm px-3 py-1 rounded-full">
                  Orisa: {f.orisa.name}
                </span>
              </section>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
