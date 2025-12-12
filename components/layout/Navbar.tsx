"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/calendar", label: "Calendar" },
    { href: "/festivals", label: "Festivals" },
    { href: "/orisha", label: "Orisha" },
  ];
  useEffect(() => {}, []);
  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold">
          Ọ̀rìṣàVerse
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-6 text-sm font-medium mx-auto">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!session?.user ? (
            <div className="hidden md:flex  gap-2">
              <Link href="/signin">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard" className="hidden md:inline-block">
              <Button variant="default" size="sm">
                Dashboard
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden px-4 pb-3 space-y-3 bg-background border-t">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              {item.label}
            </Link>
          ))}

          {!session?.user ? (
            <div className="flex flex-col gap-2">
              <Link href="/signin">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button variant="default" size="sm" className="w-full">
                Dashboard
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
