"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function PaymentVerifyInner() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [bookTitle, setBookTitle] = useState("");

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
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Payment Successful!</h1>
        {bookTitle && (
          <p className="text-muted-foreground">
            You purchased <strong>{bookTitle}</strong>. Check your email for details.
          </p>
        )}
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
