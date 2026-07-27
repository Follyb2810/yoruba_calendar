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
  type SerializedBookOrder,
} from "@/utils/serializeBookOrder";
import { isAdmin } from "@/utils/rbac";
import { MapPin, Package, Truck, Mail, Phone, CheckCheck, CheckCircle2, Star, Wallet } from "lucide-react";

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

type StatusFilter = "ALL" | "ORDERED" | "AWAITING_PAYMENT" | "SUCCESS" | "PENDING" | "FAILED";

type BookOrderListProps = {
  embedded?: boolean;
};

export default function BookOrderList({ embedded }: BookOrderListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const admin = isAdmin(session?.user);
  const [orders, setOrders] = useState<SerializedBookOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function loadOrders() {
    try {
      const q = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/books/orders${q}`, { cache: "no-store" });
      if (res.status === 403) {
        router.replace("/dashboard/become-creator");
        return;
      }
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      toast.error("Could not load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadOrders();
  }, [filter]);

  async function acknowledgeOrder(id: number) {
    const res = await fetch(`/api/books/orders/${id}/acknowledge`, {
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
    const res = await fetch("/api/orders/acknowledge-all", {
      method: "POST",
    });
    if (!res.ok) {
      toast.error("Could not clear notifications");
      return;
    }
    toast.success("All orders marked as seen");
    setOrders((prev) => prev.map((o) => ({ ...o, isNew: false })));
  }

  async function fulfillOrder(id: number) {
    const res = await fetch(`/api/books/orders/${id}/fulfill`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not mark fulfilled");
      return;
    }
    toast.success("Buyer notified — they can confirm & pay when ready");
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: "AWAITING_PAYMENT",
              isFulfilled: true,
              fulfilledAt: new Date().toISOString(),
            }
          : o
      )
    );
  }

  async function retryPayout(id: number) {
    const res = await fetch(`/api/creator/payout-retry?type=book&orderId=${id}`, {
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

  function toggleExpand(order: SerializedBookOrder) {
    const next = expandedId === order.id ? null : order.id;
    setExpandedId(next);
    if (next && order.isNew) {
      acknowledgeOrder(order.id);
    }
  }

  const newCount = orders.filter((o) => o.isNew).length;

  if (loading) {
    return (
      <p className="text-muted-foreground py-12 text-center">Loading orders…</p>
    );
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {admin ? "All Book Orders" : "My Book Orders"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Orders for your books — fulfill first, buyer pays on receipt
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
        {(["ALL", "ORDERED", "AWAITING_PAYMENT", "SUCCESS", "PENDING", "FAILED"] as StatusFilter[]).map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            className={filter === s ? "bg-orange-500 hover:bg-orange-600" : ""}
            onClick={() => setFilter(s)}
          >
            {s === "ALL" ? "All" : formatOrderStatus(s as SerializedBookOrder["status"])}
          </Button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/20">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No orders yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            New orders appear here with buyer and fulfillment details
          </p>
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
                  <div className="flex items-start gap-3 min-w-0">
                    {order.book.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.book.coverImage}
                        alt=""
                        className="h-14 w-10 object-cover rounded border shrink-0"
                      />
                    ) : (
                      <div className="h-14 w-10 rounded border bg-muted shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{order.book.title}</span>
                        {order.isNew && (
                          <Badge className="bg-orange-500 text-white text-[10px]">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.buyer.name ?? order.buyer.email} ·{" "}
                        {formatNaira(order.amountNaira)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
                    <Badge variant="outline" className="gap-1">
                      {order.fulfillmentMethod === "DELIVERY" ? (
                        <Truck className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      {order.fulfillmentMethod === "DELIVERY" ? "Delivery" : "Pickup"}
                    </Badge>
                    {order.status === "SUCCESS" && order.buyerConfirmedAt && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Buyer paid
                      </Badge>
                    )}
                    {order.status === "AWAITING_PAYMENT" && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Awaiting buyer payment
                      </Badge>
                    )}
                    {order.status === "ORDERED" && (
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Needs fulfillment
                      </Badge>
                    )}
                  </div>
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
                      {order.buyer.name && (
                        <p className="text-muted-foreground mt-1">{order.buyer.name}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Fulfillment
                      </p>
                      <p className="font-medium">{order.fulfillmentLabel}</p>
                      {order.fulfillmentMethod === "DELIVERY" ? (
                        <div className="text-muted-foreground mt-1 space-y-0.5">
                          <p>{order.deliveryAddress}</p>
                          <p>{order.deliveryCity}</p>
                          {order.deliveryPhone && (
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {order.deliveryPhone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground mt-1">
                          {order.pickupLocation ?? "Pickup location not set"}
                        </p>
                      )}
                    </div>
                  </div>
                  {order.paystackReference && (
                    <p className="text-xs text-muted-foreground">
                      Reference: {order.paystackReference}
                    </p>
                  )}
                  {order.status === "SUCCESS" && order.creatorPayoutAmount != null && (
                    <p className="text-xs flex items-center gap-1 text-muted-foreground">
                      <Wallet className="h-3 w-3" />
                      Creator payout: ₦{order.creatorPayoutAmount.toLocaleString()} —{" "}
                      {payoutLabel(order.payoutStatus)}
                    </p>
                  )}
                  {order.buyerRating != null && (
                    <p className="text-xs flex items-center gap-1">
                      <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                      Buyer rating: {order.buyerRating}/5
                      {order.buyerFeedbackAt && (
                        <span className="text-muted-foreground">· satisfied</span>
                      )}
                    </p>
                  )}
                  {order.isFulfilled &&
                    !order.buyerRating &&
                    order.buyerFeedbackAt === null && (
                      <p className="text-xs text-muted-foreground">
                        Awaiting buyer feedback
                      </p>
                    )}
                  {order.status === "ORDERED" && (
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={() => fulfillOrder(order.id)}
                    >
                      Mark ready for buyer
                    </Button>
                  )}
                  {order.status === "SUCCESS" &&
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
