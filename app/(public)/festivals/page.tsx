"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatYorubaDate } from "@/utils/formatDate";
import type { Festival } from "@/types/types";
import { CalendarDays, MapPin, Search, Video } from "lucide-react";

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFestivals() {
      setLoading(true);
      setError(null);
      try {
        const q = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`/api/festivals${q}`);
        if (!res.ok) throw new Error("Failed to fetch festivals");
        const data = await res.json();
        setFestivals(data.festivals ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchFestivals, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Yoruba Festivals</h1>
        <p className="text-muted-foreground mt-1">
          Browse community events — no account needed
        </p>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search festivals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-center py-16 text-muted-foreground">Loading festivals…</p>
      ) : error ? (
        <p className="text-center py-16 text-red-500">{error}</p>
      ) : festivals.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/20">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No published festivals yet.</p>
          <Button asChild variant="link" className="mt-2 text-orange-600">
            <Link href="/signin?callbackUrl=/dashboard/become-creator">
              Sign in to publish an event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {festivals.map((f) => (
            <Link
              key={f.id}
              href={`/festivals/${f.id}`}
              className="group border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-yellow-50 to-orange-100 overflow-hidden">
                {f.banner || f.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.banner ?? f.image ?? ""}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CalendarDays className="h-12 w-12 text-orange-300" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {f.orisa.name}
                  </Badge>
                  {f.isEnded && (
                    <Badge variant="secondary" className="text-[10px]">
                      Ended
                    </Badge>
                  )}
                  {f.eventType === "virtual" && (
                    <Badge variant="outline" className="text-[10px] gap-0.5">
                      <Video className="h-2.5 w-2.5" /> Virtual
                    </Badge>
                  )}
                </div>
                <h2 className="font-semibold line-clamp-2 leading-snug">{f.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {formatYorubaDate(new Date(f.startDate))}
                  {f.location && (
                    <span className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {f.location}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
