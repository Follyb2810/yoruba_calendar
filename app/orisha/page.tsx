"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface TOrisa {
  id: number;
  name: string;
  festivals?: { id: number; title: string }[];
}

export default function OrisaListPage() {
  const [orisas, setOrisas] = useState<TOrisa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrisas() {
      try {
        const res = await fetch("/api/orisha");
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

  if (loading) return <p className="p-6">Loading Orisas...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 space-y-16">
      <h1 className="text-2xl font-bold">All Orisas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {orisas.map((orisa) => (
          <div
            key={orisa.id}
            className="p-4 border rounded shadow hover:shadow-lg transition"
          >
            <Link key={orisa.id} href={`/orisha/${orisa.id}`}>
              <div className="p-4 border rounded shadow hover:shadow-lg transition cursor-pointer">
                <h2 className="text-xl font-semibold">{orisa.name}</h2>
              </div>
            </Link>
            {orisa.festivals && orisa.festivals.length > 0 && (
              <div className="mt-2">
                <h3 className="font-medium">Festivals:</h3>
                <ul className="list-disc ml-5 text-sm">
                  {orisa.festivals.map((f) => (
                    <li key={f.id}>{f.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {!orisa.festivals?.length && (
              <p className="mt-2 text-sm text-muted-foreground">
                No festivals assigned.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
