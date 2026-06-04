"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Package,
  Shield,
  Sparkles,
  Wallet,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import SidebarItem from "@/components/dashboard/SidebarItem";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAdmin, isCreator } from "@/utils/rbac";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [orderBadge, setOrderBadge] = useState(0);
  const { push } = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const creator = isCreator(session?.user);
  const admin = isAdmin(session?.user);

  const isEventsActive = pathname.startsWith("/dashboard/events");
  const isBooksActive = pathname.startsWith("/dashboard/books");
  const isOrdersActive = pathname.startsWith("/dashboard/orders");
  const isTeamActive = pathname.startsWith("/dashboard/team");
  const isPayoutsActive = pathname.startsWith("/dashboard/payouts");

  useEffect(() => {
    if (!creator) {
      setOrderBadge(0);
      return;
    }

    fetch("/api/orders/unread-count", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((data) => setOrderBadge(data.count ?? 0))
      .catch(() => setOrderBadge(0));
  }, [creator, pathname]);

  return (
    <section className="h-screen w-screen overflow-hidden bg-muted/30">
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b fixed top-0 left-0 right-0 z-50">
        <Link href="/" className="text-xl font-bold text-orange-500">
          Kọ́jọ́dá
        </Link>
        <button onClick={() => setMobileOpen((prev) => !prev)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className="flex h-full pt-14 md:pt-0">
        <aside
          className={`
            fixed md:static top-14 md:top-0 left-0
            h-[calc(100vh-3.5rem)] md:h-full
            w-48 bg-white border-r flex flex-col
            transform transition-transform duration-300 ease-in-out
            z-40
            ${
              mobileOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }
          `}
        >
          <Link
            href="/"
            className="hidden md:block px-6 py-5 text-2xl font-bold text-orange-500 border-b"
          >
            Kọ́jọ́dá
          </Link>

          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            <SidebarItem
              icon={<CalendarDays />}
              label="Events"
              active={isEventsActive}
              onClick={() => {
                push("/dashboard/events/all");
                setMobileOpen(false);
              }}
            />
            {creator ? (
              <>
                <SidebarItem
                  icon={<BookOpen />}
                  label="Books"
                  active={isBooksActive}
                  href="/dashboard/books"
                />
                <SidebarItem
                  icon={<Package />}
                  label="Orders"
                  active={isOrdersActive}
                  href="/dashboard/orders"
                  badge={orderBadge}
                />
                <SidebarItem
                  icon={<Wallet />}
                  label="Payouts"
                  active={isPayoutsActive}
                  href="/dashboard/payouts"
                />
              </>
            ) : (
              <SidebarItem
                icon={<Sparkles />}
                label="Become Creator"
                active={pathname.startsWith("/dashboard/become-creator")}
                href="/dashboard/become-creator"
              />
            )}
            {admin && (
              <SidebarItem
                icon={<Shield />}
                label="Team"
                active={isTeamActive}
                href="/dashboard/team"
              />
            )}
          </nav>

          <div className="px-4 py-4 space-y-2 border-t">
            <SidebarItem
              icon={<User />}
              label="Account"
              active={pathname.startsWith("/dashboard/account")}
              onClick={() => {
                push("/dashboard/account");
                setMobileOpen(false);
              }}
            />
            <SidebarItem
              icon={<LogOut />}
              label="Logout"
              danger
              onClick={() => signOut({ redirectTo: "/" })}
            />
            <SidebarItem
              icon={<HelpCircle />}
              label="Help"
              onClick={() => push("/")}
            />
          </div>
        </aside>

        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main className="flex-1 h-full overflow-y-auto bg-white p-4">
          {children}
        </main>
      </div>
    </section>
  );
}
