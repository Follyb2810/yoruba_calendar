"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Truck, MapPin } from "lucide-react";
import type { SerializedBook } from "@/utils/serializeBook";

type BookPurchasePanelProps = {
  book: Pick<
    SerializedBook,
    | "id"
    | "inStock"
    | "allowsDelivery"
    | "allowsPickup"
    | "pickupLocation"
  >;
};

export default function BookPurchasePanel({ book }: BookPurchasePanelProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const defaultMethod = book.allowsDelivery
    ? "DELIVERY"
    : book.allowsPickup
      ? "PICKUP"
      : "DELIVERY";

  const [fulfillmentMethod, setFulfillmentMethod] = useState<"DELIVERY" | "PICKUP">(
    defaultMethod
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");

  async function handleBuy() {
    if (status === "loading") return;

    if (!session) {
      router.push(`/signin?callbackUrl=/books/${book.id}`);
      return;
    }

    if (!book.inStock) {
      toast.error("This book is out of stock");
      return;
    }

    if (fulfillmentMethod === "DELIVERY") {
      if (!deliveryAddress.trim() || !deliveryCity.trim() || !deliveryPhone.trim()) {
        toast.error("Please fill in your delivery details");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/books/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          fulfillmentMethod,
          deliveryAddress: fulfillmentMethod === "DELIVERY" ? deliveryAddress : undefined,
          deliveryCity: fulfillmentMethod === "DELIVERY" ? deliveryCity : undefined,
          deliveryPhone: fulfillmentMethod === "DELIVERY" ? deliveryPhone : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place order");

      toast.success("Order placed! You'll pay after you receive the book.");
      router.push("/books");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order failed");
    } finally {
      setLoading(false);
    }
  }

  if (!book.inStock) {
    return (
      <Button disabled className="w-full">
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="space-y-4 border rounded-xl p-4 bg-muted/30">
      <div>
        <p className="text-sm font-medium mb-2">How would you like to receive it?</p>
        <p className="text-xs text-muted-foreground mb-3">
          Physical book — not a digital download
        </p>
        <div className="flex flex-col gap-2">
          {book.allowsDelivery && (
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
              <input
                type="radio"
                name="fulfillment"
                checked={fulfillmentMethod === "DELIVERY"}
                onChange={() => setFulfillmentMethod("DELIVERY")}
                className="accent-orange-500"
              />
              <Truck className="h-4 w-4 text-orange-500 shrink-0" />
              <span className="text-sm font-medium">Home delivery</span>
            </label>
          )}
          {book.allowsPickup && (
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
              <input
                type="radio"
                name="fulfillment"
                checked={fulfillmentMethod === "PICKUP"}
                onChange={() => setFulfillmentMethod("PICKUP")}
                className="accent-orange-500 mt-0.5"
              />
              <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium block">Pick up in person</span>
                {book.pickupLocation && (
                  <span className="text-xs text-muted-foreground">{book.pickupLocation}</span>
                )}
              </div>
            </label>
          )}
        </div>
      </div>

      {fulfillmentMethod === "DELIVERY" && (
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <Label htmlFor="address">Delivery address</Label>
            <Input
              id="address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                placeholder="Lagos"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={deliveryPhone}
                onChange={(e) => setDeliveryPhone(e.target.value)}
                placeholder="+234…"
              />
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleBuy}
        disabled={loading || status === "loading"}
        className="bg-orange-500 hover:bg-orange-600 w-full"
      >
        {loading
          ? "Placing order…"
          : !session
            ? "Sign in to order"
            : "Place order"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        {!session
          ? "Browse freely — sign in only when you're ready to order"
          : "Pay on receipt — no charge until you confirm you received the book"}
      </p>
    </div>
  );
}
