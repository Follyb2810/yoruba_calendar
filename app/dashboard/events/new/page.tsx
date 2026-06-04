import CreateEventForm from "@/components/dashboard/CreateEvent/CreateEventForm";
import CreatorGate from "@/components/dashboard/CreatorGate";

export default function NewEventPage() {
  return (
    <CreatorGate>
      <CreateEventForm />
    </CreatorGate>
  );
}
