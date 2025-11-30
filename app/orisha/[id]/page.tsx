"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Festival {
  id: number;
  title: string;
}

interface Orisa {
  id: number;
  name: string;
  description?: string;
  festivals?: Festival[];
}

export default function OrisaPage() {
  const params = useParams();
  const [orisa, setOrisa] = useState<Orisa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrisa() {
      try {
        const res = await fetch(`/api/orisha/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch Orisa");
        const data = await res.json();
        setOrisa(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrisa();
  }, [params.id]);

  if (loading) return <p className="p-6">Loading Orisa...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!orisa) return <p className="p-6">Orisa not found</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{orisa.name}</h1>
      {orisa.description && (
        <p className="text-md text-muted-foreground">{orisa.description}</p>
      )}

      {orisa.festivals && orisa.festivals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mt-4">Festivals:</h2>
          <ul className="list-disc ml-5 mt-2">
            {orisa.festivals.map((f) => (
              <li key={f.id}>{f.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
