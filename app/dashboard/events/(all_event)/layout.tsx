import { LinkTabs } from "@/components/shared/LinkTabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function EventTypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Events</h1>

        <Button asChild className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Link href="/dashboard/events/new">
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      <LinkTabs
        tabs={[
          { label: "All Events", href: "/dashboard/events/all" },
          { label: "Published", href: "/dashboard/events/published" },
          { label: "Drafts", href: "/dashboard/events/drafts" },
          { label: "Ended", href: "/dashboard/events/ended" },
        ]}
      />

      {children}
    </section>
  );
}
