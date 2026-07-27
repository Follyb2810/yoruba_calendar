"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Loader2, Package } from "lucide-react";
import { formatNaira, fulfillmentLabel } from "@/utils/serializeBook";

type OrderPreview = {
  id: number;
  status: string;
  bookTitle: string;
  coverImage: string | null;
  price: number;
  fulfillmentMethod: "DELIVERY" | "PICKUP";
};

type BookPayPanelProps = {
  paymentToken: string;
};

export default function BookPayPanel({ paymentToken }: BookPayPanelProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [order, setOrder] = useState<OrderPreview | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push(`/signin?callbackUrl=/books/orders/pay/${paymentToken}`);
      return;
    }

    fetch(`/api/books/orders/pay/${paymentToken}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
        } else {
          toast.error(data.error ?? "Order not found");
        }
      })
      .catch(() => toast.error("Could not load order"))
      .finally(() => setLoading(false));
  }, [session, status, paymentToken, router]);

  async function handlePay() {
    if (!confirmed) {
      toast.error("Please confirm you received the book");
      return;
    }

    setPaying(true);
    try {
      const res = await fetch("/api/books/orders/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start payment");

      window.location.href = data.authorization_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
      setPaying(false);
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="text-center py-20">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-orange-500" />
        <p className="mt-4 text-muted-foreground">Loading your order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <Package className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="text-xl font-semibold">Order not found</h1>
        <p className="text-muted-foreground text-sm">
          This link may be invalid or the order is no longer awaiting payment.
        </p>
        <Button asChild variant="outline">
          <Link href="/books">Back to Book Shop</Link>
        </Button>
      </div>
    );
  }

  if (order.status === "SUCCESS") {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
        <h1 className="text-xl font-semibold">Already paid</h1>
        <p className="text-muted-foreground text-sm">
          Payment for <strong>{order.bookTitle}</strong> is complete.
        </p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/books">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  if (order.status !== "AWAITING_PAYMENT" && order.status !== "PENDING") {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <Package className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="text-xl font-semibold">Not ready for payment</h1>
        <p className="text-muted-foreground text-sm">
          The seller hasn&apos;t marked your order as ready yet. You&apos;ll get another email when
          it&apos;s time to pay.
        </p>
        <Button asChild variant="outline">
          <Link href="/books">Back to Book Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 py-12 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Confirm & pay</h1>
        <p className="text-muted-foreground text-sm">
          Pay only after you&apos;ve received your book
        </p>
      </div>

      <div className="border rounded-xl p-4 flex gap-4 items-start bg-muted/20">
        {order.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={order.coverImage}
            alt=""
            className="h-24 w-16 object-cover rounded border shrink-0"
          />
        ) : (
          <div className="h-24 w-16 rounded border bg-muted shrink-0" />
        )}
        <div>
          <p className="font-medium">{order.bookTitle}</p>
          <p className="text-lg font-semibold text-orange-600 mt-1">
            {formatNaira(order.price)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {fulfillmentLabel(order.fulfillmentMethod)}
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50/50">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 accent-orange-500"
        />
        <span className="text-sm">
          I confirm I have received my copy of this book and I&apos;m satisfied to proceed with
          payment.
        </span>
      </label>

      <Button
        onClick={handlePay}
        disabled={!confirmed || paying}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        {paying ? "Redirecting to Paystack…" : `Pay ${formatNaira(order.price)}`}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Secure payment via Paystack. If something is wrong with your order, contact the seller
        before paying.
      </p>
    </div>
  );
}
