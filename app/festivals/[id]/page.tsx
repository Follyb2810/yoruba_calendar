export default async function FestivalDetails({ params }: any) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/festivals/${params.id}`,
    { cache: "no-store" }
  );
  const { festival } = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{festival.title}</h1>
      <p className="text-sm text-muted-foreground">
        {festival.start} → {festival.end}
      </p>
    </div>
  );
}
