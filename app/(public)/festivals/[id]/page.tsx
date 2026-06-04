import BackButton from "@/components/shared/BackButton";
import { formatYorubaDate } from "@/utils/formatDate";
import type { Festival } from "@/types/types";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

async function getFestival(id: string): Promise<Festival | null> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/festivals/${id}`, {
    cache: "no-store",
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

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <BackButton />
      <div className="bg-linear-to-r from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow mt-4">
        <h1 className="text-4xl font-bold mb-4 text-center">{festival.title}</h1>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md flex-1 text-center">
            <h2 className="font-semibold text-lg text-gray-600">Start Date</h2>
            <p className="text-xl font-medium text-gray-800 mt-1">{startDate}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md flex-1 text-center">
            <h2 className="font-semibold text-lg text-gray-600">End Date</h2>
            <p className="text-xl font-medium text-gray-800 mt-1">{endDate}</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <span className="inline-block bg-yellow-200 text-yellow-800 text-sm px-4 py-2 rounded-full font-medium">
            Orisa: {festival.orisa.name}
          </span>
        </div>
        {festival.location && (
          <p className="mt-4 text-center text-gray-600">
            📍 {festival.location}, {festival.country}
          </p>
        )}
        <p className="mt-6 text-gray-700 text-center text-lg leading-relaxed">
          {festival.description}
        </p>
        {festival.tickets && festival.tickets.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-4 text-center">Tickets</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {festival.tickets.map((t) => (
                <div key={t.id} className="border rounded-lg p-4 text-center">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-orange-600 font-semibold mt-1">
                    {t.isFree ? "Free" : `₦${t.price?.toLocaleString()}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.quantity - t.sold} remaining
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
