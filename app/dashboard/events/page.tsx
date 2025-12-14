import EventCard from "@/components/dashboard/EventCard";
import { redirect } from "next/navigation";
export default function EventsDashboard() {
  return redirect("/dashboard/events/all");
}
