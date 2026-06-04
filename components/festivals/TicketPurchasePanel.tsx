"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Ticket } from "lucide-react";

type TicketItem = {
  id: number;
  name: string;
  type: string;
  isFree: boolean;
  price: number | null;
  quantity: number;
  sold: number;
  maxPerGroup: number | null;
};

type TicketPurchasePanelProps = {
  festivalId: number;
  isEnded: boolean;
  tickets: TicketItem[];
};

export default function TicketPurchasePanel({
  festivalId,
  isEnded,
  tickets,
}: TicketPurchasePanelProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [phones, setPhones] = useState<Record<number, string>>({});

  function getQuantity(ticket: TicketItem): number {
    return quantities[ticket.id] ?? 1;
  }

  function setQuantity(ticketId: number, value: number) {
    setQuantities((prev) => ({ ...prev, [ticketId]: value }));
  }

  async function handlePurchase(ticket: TicketItem) {
    if (status === "loading") return;

    if (!session) {
      router.push(`/signin?callbackUrl=/festivals/${festivalId}`);
      return;
    }

    if (isEnded) {
      toast.error("This event has ended");
      return;
    }

    const remaining = ticket.quantity - ticket.sold;
    const qty = getQuantity(ticket);

    if (remaining <= 0) {
      toast.error("Sold out");
      return;
    }

    if (qty > remaining) {
      toast.error(`Only ${remaining} ticket(s) left`);
      return;
    }

    setLoadingId(ticket.id);

    try {
      if (ticket.isFree) {
        const res = await fetch("/api/tickets/reserve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId: ticket.id,
            quantity: qty,
            buyerPhone: phones[ticket.id] || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Reservation failed");

        toast.success("Free ticket reserved! Check your email for confirmation.");
        router.refresh();
        return;
      }

      const res = await fetch("/api/paystack/tickets/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          quantity: qty,
          buyerPhone: phones[ticket.id] || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start payment");

      window.location.href = data.authorization_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingId(null);
    }
  }

  if (isEnded) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        This event has ended — ticket sales are closed.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-center text-muted-foreground">
        Browse freely — sign in to buy or reserve tickets
      </p>
      {tickets.map((ticket) => {
        const remaining = Math.max(0, ticket.quantity - ticket.sold);
        const soldOut = remaining <= 0;
        const maxQty =
          ticket.type === "group" && ticket.maxPerGroup
            ? Math.min(ticket.maxPerGroup, remaining)
            : 1;
        const qty = Math.min(getQuantity(ticket), maxQty || 1);
        const lineTotal = ticket.isFree ? 0 : (ticket.price ?? 0) * qty;

        return (
          <div
            key={ticket.id}
            className="border rounded-xl p-4 bg-white space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-orange-500" />
                  {ticket.name}
                </p>
                <p className="text-orange-600 font-semibold mt-1">
                  {ticket.isFree ? "Free" : `₦${lineTotal.toLocaleString()}`}
                  {!ticket.isFree && qty > 1 && (
                    <span className="text-xs text-muted-foreground font-normal ml-1">
                      (₦{ticket.price?.toLocaleString()} × {qty})
                    </span>
                  )}
                </p>
              </div>
              <Badge variant={soldOut ? "secondary" : "outline"}>
                {soldOut ? "Sold out" : `${remaining} left`}
              </Badge>
            </div>

            {!soldOut && ticket.type === "group" && maxQty > 1 && (
              <div className="space-y-1">
                <Label htmlFor={`qty-${ticket.id}`}>Quantity</Label>
                <Input
                  id={`qty-${ticket.id}`}
                  type="number"
                  min={1}
                  max={maxQty}
                  value={qty}
                  onChange={(e) =>
                    setQuantity(ticket.id, Number(e.target.value) || 1)
                  }
                  className="w-24"
                />
              </div>
            )}

            {!soldOut && (
              <div className="space-y-1">
                <Label htmlFor={`phone-${ticket.id}`}>Phone (optional)</Label>
                <Input
                  id={`phone-${ticket.id}`}
                  value={phones[ticket.id] ?? ""}
                  onChange={(e) =>
                    setPhones((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                  }
                  placeholder="+234…"
                />
              </div>
            )}

            <Button
              onClick={() => handlePurchase(ticket)}
              disabled={soldOut || loadingId === ticket.id || status === "loading"}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {loadingId === ticket.id
                ? "Processing…"
                : soldOut
                  ? "Sold out"
                  : !session
                    ? ticket.isFree
                      ? "Sign in to reserve"
                      : "Sign in to buy"
                    : ticket.isFree
                      ? "Reserve free ticket"
                      : "Pay with Paystack"}
            </Button>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground text-center">
        Secure payment via Paystack for paid tickets
      </p>
    </div>
  );
}
