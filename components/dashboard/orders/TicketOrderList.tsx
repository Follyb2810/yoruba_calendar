"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatNaira,
  formatOrderStatus,
  type SerializedTicketOrder,
} from "@/utils/serializeTicketOrder";
import { isAdmin } from "@/utils/rbac";
import { formatYorubaDate } from "@/utils/formatDate";
import { CalendarDays, Mail, Phone, Ticket, CheckCheck, CheckCircle2, Star, Wallet } from "lucide-react";

function payoutLabel(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "Creator paid";
    case "PROCESSING":
      return "Payout processing";
    case "FAILED":
      return "Payout failed";
    case "SKIPPED":
      return "No payout";
    default:
      return "Payout pending";
  }
}

type StatusFilter = "ALL" | "SUCCESS" | "PENDING" | "FAILED";

type TicketOrderListProps = {
  embedded?: boolean;
};

export default function TicketOrderList({ embedded }: TicketOrderListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const admin = isAdmin(session?.user);
  const [orders, setOrders] = useState<SerializedTicketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function loadOrders() {
    try {
      const q = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/festivals/orders${q}`, { cache: "no-store" });
      if (res.status === 403) {
        router.replace("/dashboard/become-creator");
        return;
      }
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      toast.error("Could not load ticket orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadOrders();
  }, [filter]);

  async function acknowledgeOrder(id: number) {
    const res = await fetch(`/api/festivals/orders/${id}/acknowledge`, {
      method: "PATCH",
    });
    if (!res.ok) {
      toast.error("Could not mark order as seen");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, isNew: false } : o))
    );
  }

  async function acknowledgeAll() {
    const res = await fetch("/api/orders/acknowledge-all", { method: "POST" });
    if (!res.ok) {
      toast.error("Could not clear notifications");
      return;
    }
    toast.success("All orders marked as seen");
    setOrders((prev) => prev.map((o) => ({ ...o, isNew: false })));
  }

  async function fulfillOrder(id: number) {
    const res = await fetch(`/api/festivals/orders/${id}/fulfill`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not mark fulfilled");
      return;
    }
    toast.success("Ticket marked fulfilled — buyer notified by email");
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, isFulfilled: true, fulfilledAt: new Date().toISOString() }
          : o
      )
    );
  }

  async function retryPayout(id: number) {
    const res = await fetch(`/api/creator/payout-retry?type=ticket&orderId=${id}`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Payout retry failed");
      return;
    }
    toast.success("Payout retry initiated");
    loadOrders();
  }

  function toggleExpand(order: SerializedTicketOrder) {
    const next = expandedId === order.id ? null : order.id;
    setExpandedId(next);
    if (next && order.isNew) {
      acknowledgeOrder(order.id);
    }
  }

  const newCount = orders.filter((o) => o.isNew).length;

  if (loading) {
    return (
      <p className="text-muted-foreground py-12 text-center">Loading ticket orders…</p>
    );
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {admin ? "All Ticket Orders" : "My Ticket Orders"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Paid and free ticket reservations for your events
            </p>
          </div>
          {newCount > 0 && (
            <Button variant="outline" size="sm" onClick={acknowledgeAll} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark all seen ({newCount})
            </Button>
          )}
        </div>
      )}

      {embedded && newCount > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={acknowledgeAll} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all seen ({newCount})
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(["ALL", "SUCCESS", "PENDING", "FAILED"] as StatusFilter[]).map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            className={filter === s ? "bg-orange-500 hover:bg-orange-600" : ""}
            onClick={() => setFilter(s)}
          >
            {s === "ALL" ? "All" : formatOrderStatus(s as SerializedTicketOrder["status"])}
          </Button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/20">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No ticket orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`border rounded-xl overflow-hidden ${
                order.isNew ? "border-orange-300 bg-orange-50/30" : "bg-white"
              }`}
            >
              <button
                type="button"
                className="w-full text-left p-4 hover:bg-muted/20 transition"
                onClick={() => toggleExpand(order)}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{order.festival.title}</span>
                      {order.isNew && (
                        <Badge className="bg-orange-500 text-white text-[10px]">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.ticket.name} · {order.buyer.name ?? order.buyer.email} ·{" "}
                      {order.ticket.isFree ? "Free" : formatNaira(order.amountNaira)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.quantity} ticket{order.quantity !== 1 ? "s" : ""} ·{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      order.status === "SUCCESS"
                        ? "default"
                        : order.status === "FAILED"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {formatOrderStatus(order.status)}
                  </Badge>
                  {order.status === "SUCCESS" && (
                    order.isFulfilled ? (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Fulfilled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Awaiting event
                      </Badge>
                    )
                  )}
                </div>
              </button>

              {expandedId === order.id && (
                <div className="border-t px-4 py-4 bg-muted/10 text-sm space-y-3">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Buyer
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <a
                          href={`mailto:${order.buyer.email}`}
                          className="text-orange-600 hover:underline"
                        >
                          {order.buyer.email}
                        </a>
                      </p>
                      {order.buyerPhone && (
                        <p className="flex items-center gap-1 mt-1 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {order.buyerPhone}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Event
                      </p>
                      <p className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatYorubaDate(new Date(order.festival.startDate))}
                      </p>
                      {order.festival.location && (
                        <p className="text-muted-foreground mt-1">
                          {order.festival.location}, {order.festival.country}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reference: {order.paystackReference}
                  </p>
                  {order.isFulfilled && order.creatorPayoutAmount != null && order.creatorPayoutAmount > 0 && (
                    <p className="text-xs flex items-center gap-1 text-muted-foreground">
                      <Wallet className="h-3 w-3" />
                      Payout: ₦{order.creatorPayoutAmount.toLocaleString()} —{" "}
                      {payoutLabel(order.payoutStatus)}
                    </p>
                  )}
                  {order.buyerRating != null && (
                    <p className="text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                      Attendee rating: {order.buyerRating}/5
                    </p>
                  )}
                  {order.isFulfilled && !order.buyerRating && (
                    <p className="text-xs text-muted-foreground">Awaiting attendee feedback</p>
                  )}
                  {order.status === "SUCCESS" && !order.isFulfilled && (
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={() => fulfillOrder(order.id)}
                    >
                      Mark as attended / fulfilled
                    </Button>
                  )}
                  {order.isFulfilled &&
                    (order.payoutStatus === "FAILED" || order.payoutStatus === "PENDING") &&
                    order.creatorPayoutAmount != null &&
                    order.creatorPayoutAmount > 0 && (
                      <Button size="sm" variant="outline" onClick={() => retryPayout(order.id)}>
                        Retry creator payout
                      </Button>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
