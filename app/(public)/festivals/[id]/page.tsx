import BackButton from "@/components/shared/BackButton";
import { MONTH_NAMES, YORUBA_WEEK_DAYS } from "@/constants/mock";
import { Festival } from "@/types/types";
import { notFound } from "next/navigation";

function formatYorubaDate(day: number, month: number, year: number) {
  const date = new Date(year, month - 1, day);
  console.log({ s: date.getDay() });
  const weekDay = YORUBA_WEEK_DAYS[date.getDay()];
  const monthName = MONTH_NAMES[month - 1];
  console.log({ date, weekDay, monthName, year });
  return `${weekDay}, ${day} ${monthName} ${year}`;
}

interface Props {
  params: { id: string };
}

export default async function FestivalDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  console.log(id);
  console.log({ NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL });
  console.log({ NEXT_LOCAL_WEBSITE_URL: process.env.NEXT_LOCAL_WEBSITE_URL });
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/festivals/${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const { festival } = (await res.json()) as { festival: Festival };
  console.log({ festival });
  const startDate = formatYorubaDate(
    festival.startDay,
    festival.startMonth,
    festival.startYear
  );
  const endDate = formatYorubaDate(
    festival.endDay,
    festival.endMonth,
    festival.endYear
  );

  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <BackButton />
      <div className="bg-linear-to-r from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow">
        <h1 className="text-4xl font-bold mb-4 text-center">
          {festival.title}
        </h1>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md flex-1 text-center">
            <h2 className="font-semibold text-lg text-gray-600">Start Date</h2>
            <p className="text-xl font-medium text-gray-800 mt-1">
              {startDate}
            </p>
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
        <p className="mt-6 text-gray-700 text-center text-lg">
          This festival celebrates and honors the {festival.orisa.name} Orisa,
          showcasing traditions, ceremonies, and cultural heritage. Make sure to
          attend to experience the rich Yoruba culture!
        </p>
      </div>
    </section>
  );
}
