"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Truck, MapPin } from "lucide-react";

type FulfillmentInfo = {
  method: "DELIVERY" | "PICKUP";
  label: string;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  deliveryPhone?: string | null;
  pickupLocation?: string | null;
};

function PaymentVerifyInner() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [bookTitle, setBookTitle] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentInfo | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }

    fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setStatus("success");
          setBookTitle(data.book?.title ?? "");
          setFulfillment(data.fulfillment ?? null);
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="text-center py-20 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-500" />
        <p>Confirming your payment…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto px-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Payment confirmed!</h1>
        {bookTitle && (
          <p className="text-muted-foreground">
            Thank you for confirming receipt of <strong>{bookTitle}</strong>.
          </p>
        )}
        {fulfillment && (
          <div className="text-left border rounded-lg p-4 bg-muted/30 text-sm space-y-2">
            <p className="font-medium flex items-center gap-2">
              {fulfillment.method === "DELIVERY" ? (
                <Truck className="h-4 w-4 text-orange-500" />
              ) : (
                <MapPin className="h-4 w-4 text-orange-500" />
              )}
              {fulfillment.label}
            </p>
            {fulfillment.method === "DELIVERY" && (
              <p className="text-muted-foreground">
                {fulfillment.deliveryAddress}, {fulfillment.deliveryCity}
                <br />
                Phone: {fulfillment.deliveryPhone}
              </p>
            )}
            {fulfillment.method === "PICKUP" && fulfillment.pickupLocation && (
              <p className="text-muted-foreground">{fulfillment.pickupLocation}</p>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Payment confirmed. The seller has been notified and will receive their payout shortly.
        </p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/books">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-20 space-y-4 max-w-md mx-auto">
      <XCircle className="h-16 w-16 text-red-500 mx-auto" />
      <h1 className="text-2xl font-bold">Payment Failed</h1>
      <p className="text-muted-foreground">
        Something went wrong. You were not charged, or the payment could not be verified.
      </p>
      <Button asChild variant="outline">
        <Link href="/books">Back to Book Shop</Link>
      </Button>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<p className="text-center py-20">Loading…</p>}>
      <PaymentVerifyInner />
    </Suspense>
  );
}
