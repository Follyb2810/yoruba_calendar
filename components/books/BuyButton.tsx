"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BuyButtonProps = {
  bookId: number;
  inStock: boolean;
  className?: string;
};

export default function BuyButton({ bookId, inStock, className }: BuyButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    if (status === "loading") return;

    if (!session) {
      router.push(`/signin?callbackUrl=/books/${bookId}`);
      return;
    }

    if (!inStock) {
      toast.error("This book is out of stock");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Could not start payment");
      }

      window.location.href = data.authorization_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleBuy}
      disabled={loading || !inStock}
      className={className ?? "bg-orange-500 hover:bg-orange-600 w-full"}
    >
      {loading ? "Redirecting to Paystack…" : inStock ? "Buy Now" : "Out of Stock"}
    </Button>
  );
}
