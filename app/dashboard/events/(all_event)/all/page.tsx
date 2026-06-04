import EventList from "@/components/dashboard/EventList";

export default function AllEventsDashboard() {
  return (
    <section className="flex-1">
      <EventList filter="all" />
    </section>
  );
}
