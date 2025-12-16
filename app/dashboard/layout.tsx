"use client";

import { useState } from "react";
import {
  CalendarDays,
  Tag,
  Ticket,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import SidebarItem from "@/components/dashboard/SidebarItem";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { push } = useRouter();

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
        {/* Sidebar */}
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

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            <SidebarItem
              icon={<CalendarDays />}
              label="Events"
              active
              onClick={() => {
                push("/dashboard/events/all");
                setMobileOpen(false);
              }}
            />
            {/* <SidebarItem
              icon={<Tag />}
              label="Discounts"
              onClick={() => {
                push("/dashboard/discount");
                setMobileOpen(false);
              }}
            />
            <SidebarItem
              icon={<Ticket />}
              label="Box Office"
              onClick={() => {
                push("/dashboard/box_office");
                setMobileOpen(false);
              }}
            /> */}
            <SidebarItem
              icon={<User />}
              label="Account"
              onClick={() => {
                push("/dashboard/account");
                setMobileOpen(false);
              }}
            />
          </nav>

          {/* Bottom actions */}
          <div className="px-4 py-4 space-y-2 border-t">
            <SidebarItem
              icon={<HelpCircle />}
              label="Help"
              onClick={() => signOut({ redirectTo: "/" })}
            />
            <SidebarItem
              icon={<LogOut />}
              label="Logout"
              danger
              onClick={() => signOut({ redirectTo: "/" })}
            />
          </div>
        </aside>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 h-full overflow-y-auto bg-white p-4">
          {children}
        </main>
      </div>
    </section>
  );
}
