"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Ticket } from "lucide-react";

function PaymentVerifyInner() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [festivalTitle, setFestivalTitle] = useState("");
  const [ticketName, setTicketName] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }

    fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.orderType === "ticket") {
          setStatus("success");
          setFestivalTitle(data.festival?.title ?? "");
          setTicketName(data.ticket?.name ?? "");
          setQuantity(data.ticket?.quantity ?? 1);
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
        <h1 className="text-2xl font-bold">Ticket confirmed!</h1>
        {festivalTitle && (
          <p className="text-muted-foreground">
            You&apos;re going to <strong>{festivalTitle}</strong>
          </p>
        )}
        <div className="text-left border rounded-lg p-4 bg-muted/30 text-sm space-y-1">
          <p className="font-medium flex items-center gap-2">
            <Ticket className="h-4 w-4 text-orange-500" />
            {ticketName}
          </p>
          <p className="text-muted-foreground">
            {quantity === 1 ? "1 ticket" : `${quantity} tickets`}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          A confirmation email has been sent. The organizer may contact you with event details.
        </p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/festivals">Browse Events</Link>
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
        <Link href="/festivals">Back to Festivals</Link>
      </Button>
    </div>
  );
}

export default function FestivalPaymentVerifyPage() {
  return (
    <Suspense fallback={<p className="text-center py-20">Loading…</p>}>
      <PaymentVerifyInner />
    </Suspense>
  );
}
