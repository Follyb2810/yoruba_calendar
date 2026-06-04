"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatYorubaDate } from "@/utils/formatDate";
import type { Festival } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Plus, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";
import EventCard from "./EventCard";

type EventListProps = {
  filter: "all" | "published" | "drafts" | "ended";
};

export default function EventList({ filter }: EventListProps) {
  const router = useRouter();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/festivals?mine=true&filter=${filter}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        setFestivals(data.festivals);
      } catch {
        toast.error("Could not load your events");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  async function handlePublish(id: number) {
    const res = await fetch(`/api/festivals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    if (!res.ok) {
      toast.error("Failed to publish event");
      return;
    }
    toast.success("Event published!");
    setFestivals((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "PUBLISHED" } : f))
    );
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    const res = await fetch(`/api/festivals/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete event");
      return;
    }
    toast.success("Event deleted");
    setFestivals((prev) => prev.filter((f) => f.id !== id));
  }

  if (loading) {
    return (
      <p className="text-muted-foreground text-center py-12">Loading events…</p>
    );
  }

  if (festivals.length === 0) {
    return <EventCard />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {festivals.map((f) => (
        <Card key={f.id} className="flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg leading-snug">{f.title}</CardTitle>
              <Badge
                variant={
                  f.status === "PUBLISHED"
                    ? f.isEnded
                      ? "secondary"
                      : "default"
                    : "outline"
                }
              >
                {f.isEnded ? "Ended" : f.status === "DRAFT" ? "Draft" : "Live"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{f.orisa.name}</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            <p className="text-sm flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-orange-500" />
              {formatYorubaDate(new Date(f.startDate))}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {f.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/festivals/${f.id}`}>
                  <Globe className="h-3.5 w-3.5 mr-1" /> View
                </Link>
              </Button>
              {f.status === "DRAFT" && (
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => handlePublish(f.id)}
                >
                  Publish
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => handleDelete(f.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
