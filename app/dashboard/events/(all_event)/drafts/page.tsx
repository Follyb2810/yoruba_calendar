import EventList from "@/components/dashboard/EventList";

export default function DraftsPage() {
  return (
    <section className="flex-1">
      <EventList filter="drafts" />
    </section>
  );
}
