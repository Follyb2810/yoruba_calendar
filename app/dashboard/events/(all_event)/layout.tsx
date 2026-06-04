import Link from "next/link";
import { auth } from "@/utils/auth";
import { isCreator } from "@/utils/rbac";
import { LinkTabs } from "@/components/shared/LinkTabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function EventTypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const creator = isCreator(session?.user);

  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your festival listings
          </p>
        </div>

        {creator ? (
          <Button asChild className="bg-orange-500 hover:bg-orange-600 gap-2 shrink-0">
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4" />
              New Event
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/dashboard/become-creator">Become Creator</Link>
          </Button>
        )}
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
