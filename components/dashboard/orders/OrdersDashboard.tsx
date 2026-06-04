"use client";

import { useState } from "react";
import BookOrderList from "@/components/dashboard/orders/BookOrderList";
import TicketOrderList from "@/components/dashboard/orders/TicketOrderList";
import { Button } from "@/components/ui/button";

type Tab = "books" | "tickets";

export default function OrdersDashboard() {
  const [tab, setTab] = useState<Tab>("books");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={tab === "books" ? "default" : "outline"}
          size="sm"
          className={tab === "books" ? "bg-orange-500 hover:bg-orange-600" : ""}
          onClick={() => setTab("books")}
        >
          Book orders
        </Button>
        <Button
          variant={tab === "tickets" ? "default" : "outline"}
          size="sm"
          className={tab === "tickets" ? "bg-orange-500 hover:bg-orange-600" : ""}
          onClick={() => setTab("tickets")}
        >
          Ticket orders
        </Button>
      </div>

      {tab === "books" ? <BookOrderList embedded /> : <TicketOrderList embedded />}
    </div>
  );
}
