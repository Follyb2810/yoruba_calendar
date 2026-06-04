import BackButton from "@/components/shared/BackButton";
import TicketPurchasePanel from "@/components/festivals/TicketPurchasePanel";
import { formatYorubaDate } from "@/utils/formatDate";
import { getBaseUrl } from "@/utils/getBaseUrl";
import type { Festival } from "@/types/types";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, ExternalLink, MapPin, Video } from "lucide-react";

async function getFestival(id: string): Promise<Festival | null> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/festivals/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.festival;
}

export default async function FestivalDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const festival = await getFestival(id);

  if (!festival) notFound();

  const startDate = formatYorubaDate(new Date(festival.startDate));
  const endDate = formatYorubaDate(new Date(festival.endDate));
  const heroImage = festival.banner ?? festival.image;

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <BackButton />

      {heroImage && (
        <div className="mt-4 aspect-[21/9] rounded-2xl overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-sm border p-6 md:p-8 mt-4 space-y-6">
        <div className="text-center space-y-3">
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-orange-500">{festival.orisa.name}</Badge>
            {festival.isEnded && <Badge variant="secondary">Ended</Badge>}
            <Badge variant="outline">
              {festival.eventType === "virtual" ? "Virtual" : "In person"}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{festival.title}</h1>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <CalendarDays className="h-4 w-4" /> Starts
            </p>
            <p className="font-medium mt-1">{startDate}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <CalendarDays className="h-4 w-4" /> Ends
            </p>
            <p className="font-medium mt-1">{endDate}</p>
          </div>
        </div>

        {festival.eventType === "physical" && festival.location && (
          <p className="text-center text-muted-foreground flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {festival.location}, {festival.country}
          </p>
        )}

        {festival.eventType === "virtual" && festival.eventLink && (
          <div className="text-center">
            <Button asChild variant="outline" className="gap-2">
              <a href={festival.eventLink} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4" />
                Join online
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        )}

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {festival.description}
        </p>

        {festival.tickets && festival.tickets.length > 0 && (
          <div className="bg-white rounded-xl p-6 border space-y-4">
            <h2 className="font-semibold text-lg text-center">Get Tickets</h2>
            <TicketPurchasePanel
              festivalId={festival.id}
              isEnded={festival.isEnded}
              tickets={festival.tickets}
            />
          </div>
        )}
      </div>
    </section>
  );
}
