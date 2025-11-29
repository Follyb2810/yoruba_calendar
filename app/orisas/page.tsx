"use client";

import { useEffect, useState } from "react";

interface Orisa {
  id: number;
  name: string;
  festivals: Festival[];
}

interface Festival {
  id: number;
  title: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

export default function OrisasPage() {
  const [orisas, setOrisas] = useState<Orisa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrisas() {
      try {
        const res = await fetch("/api/orisas?limit=50");
        if (!res.ok) throw new Error("Failed to fetch Orisas");
        const data = await res.json();
        setOrisas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrisas();
  }, []);

  if (loading) return <p>Loading Orisas...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orisas</h1>
      <ul>
        {orisas.map((orisa) => (
          <li key={orisa.id} className="mb-4 border-b pb-2">
            <h2 className="text-xl font-semibold">{orisa.name}</h2>
            <h3 className="font-medium">Festivals:</h3>
            <ul className="ml-4 list-disc">
              {orisa.festivals.map((f) => (
                <li key={f.id}>
                  {f.title} ({f.startMonth}/{f.startDay} - {f.endMonth}/
                  {f.endDay})
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
