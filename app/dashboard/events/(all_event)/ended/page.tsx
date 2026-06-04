import EventList from "@/components/dashboard/EventList";

export default function EndedPage() {
  return (
    <section className="flex-1">
      <EventList filter="ended" />
    </section>
  );
}
