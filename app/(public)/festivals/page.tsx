"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatYorubaDate } from "@/utils/formatDate";
import type { Festival } from "@/types/types";

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFestivals() {
      try {
        const res = await fetch("/api/festivals?limit=50");
        if (!res.ok) throw new Error("Failed to fetch festivals");
        const data = await res.json();
        setFestivals(data.festivals);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchFestivals();
  }, []);

  if (loading) {
    return <p className="text-center py-10">Loading festivals…</p>;
  }
  if (error) {
    return <p className="text-center py-10 text-red-500">Error: {error}</p>;
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Yoruba Festivals</h1>
        <p className="text-muted-foreground">
          Celebrations honoring the Orisa and our shared heritage
        </p>
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {festivals.map((f) => (
          <Link key={f.id} href={`/festivals/${f.id}`}>
            <section className="block border rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow bg-white h-full">
              <h2 className="text-xl font-semibold mb-2">{f.title}</h2>
              <p className="text-gray-700 mb-1 text-sm">
                <span className="font-medium">Start:</span>{" "}
                {formatYorubaDate(new Date(f.startDate))}
              </p>
              <p className="text-gray-700 mb-3 text-sm">
                <span className="font-medium">End:</span>{" "}
                {formatYorubaDate(new Date(f.endDate))}
              </p>
              <span className="inline-block bg-yellow-200 text-yellow-800 text-sm px-3 py-1 rounded-full">
                {f.orisa.name}
              </span>
            </section>
          </Link>
        ))}
      </div>
    </section>
  );
}
