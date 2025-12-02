"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold">
          Ọ̀rìṣàVerse
        </Link>

        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/">Home</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/festivals">Festivals</Link>
          <Link href="/orisha/new">Orisha</Link>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-3 space-y-3">
          <Link href="/" className="block">
            Home
          </Link>
          <Link href="/calendar" className="block">
            Calendar
          </Link>
          <Link href="/festivals" className="block">
            Festivals
          </Link>
          <Link href="/orisha/new">Orisha</Link>
        </div>
      )}
    </nav>
  );
}
