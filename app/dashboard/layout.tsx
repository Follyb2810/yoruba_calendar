"use client";
import {
  CalendarDays,
  Tag,
  Ticket,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";
import SidebarItem from "@/components/dashboard/SidebarItem";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex min-h-screen bg-muted/30">
        <aside className="w-64 bg-white border-r flex flex-col">
          <Link
            href={"/"}
            className="px-6 py-5 text-2xl font-bold text-orange-500"
          >
            Kọ́jọ́dá
          </Link>

          <nav className="flex-1 px-4 space-y-2">
            <SidebarItem
              icon={<CalendarDays />}
              label="Events"
              active
              href="/dashboard/"
            />
            <SidebarItem
              icon={<Tag />}
              label="Discounts"
              href="/dashboard/discount"
            />
            <SidebarItem
              icon={<Ticket />}
              label="Box Office"
              href="/dashboard/box_office"
            />
            <SidebarItem
              icon={<User />}
              label="Account"
              href="/dashboard/account"
            />
          </nav>

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

        {children}
      </div>
    </section>
  );
}
