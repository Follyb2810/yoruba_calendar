import { LinkTabs } from "@/components/shared/LinkTabs";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export default function EventTypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 w-full p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Events</h1>

        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
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
