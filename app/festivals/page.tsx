"use client";

import { useEffect, useState } from "react";

interface Festival {
  id: number;
  title: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  orisa: { id: number; name: string };
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
        setFestivals(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFestivals();
  }, []);

  if (loading) return <p>Loading Festivals...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Festivals</h1>
      <ul>
        {festivals.map((f) => (
          <li key={f.id} className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">{f.title}</h2>
            <p>
              {f.startMonth}/{f.startDay} - {f.endMonth}/{f.endDay}
            </p>
            <p>Orisa: {f.orisa.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
