import EventList from "@/components/dashboard/EventList";

export default function PublishedPage() {
  return (
    <section className="flex-1">
      <EventList filter="published" />
    </section>
  );
}
