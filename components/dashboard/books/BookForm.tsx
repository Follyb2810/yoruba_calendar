"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/shared/ImageUpload";
import type { SerializedBook } from "@/utils/serializeBook";

type BookFormProps = {
  initial?: SerializedBook;
  mode: "create" | "edit";
};

export default function BookForm({ initial, mode }: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    author: initial?.author ?? "",
    price: initial?.price?.toString() ?? "",
    coverImage: initial?.coverImage ?? "",
    backImage: initial?.backImage ?? "",
    stock: initial?.stock?.toString() ?? "0",
    status: (initial?.status ?? "DRAFT") as "DRAFT" | "PUBLISHED",
    allowsDelivery: initial?.allowsDelivery ?? true,
    allowsPickup: initial?.allowsPickup ?? true,
    pickupLocation: initial?.pickupLocation ?? "",
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.coverImage) {
      toast.error("Please upload a front cover photo");
      return;
    }

    if (form.allowsPickup && !form.pickupLocation.trim()) {
      toast.error("Pickup location is required when pickup is enabled");
      return;
    }

    if (!form.allowsDelivery && !form.allowsPickup) {
      toast.error("Enable delivery or pickup (or both)");
      return;
    }

    setLoading(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      author: form.author.trim(),
      price: Number(form.price),
      coverImage: form.coverImage,
      backImage: form.backImage || undefined,
      stock: Number(form.stock),
      status: form.status,
      currency: "NGN",
      allowsDelivery: form.allowsDelivery,
      allowsPickup: form.allowsPickup,
      pickupLocation: form.allowsPickup ? form.pickupLocation.trim() : undefined,
    };

    try {
      const url = mode === "create" ? "/api/books" : `/api/books/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save book");

      toast.success(mode === "create" ? "Book listed!" : "Book updated!");
      router.push("/dashboard/books");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg border bg-orange-50/50 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Physical books only.</strong> Upload cover
        photos for your listing — not the book file. Buyers pay online and receive the
        book via delivery or pickup.
      </div>

      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Book title"
          required
          minLength={3}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          value={form.author}
          onChange={(e) => update("author", e.target.value)}
          placeholder="Author name"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe the physical book, edition, condition…"
          required
          minLength={20}
          className="min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="price">Price (₦)</Label>
          <Input
            id="price"
            type="number"
            min={1}
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="stock">Copies in stock</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Cover photos (images only)</Label>
        <div className="grid sm:grid-cols-2 gap-6">
          <ImageUpload
            label="Front cover *"
            value={form.coverImage}
            onChange={(url) => update("coverImage", url)}
            folder="yoruba_calendar/books/covers"
            hint="Photo of the book front"
          />
          <ImageUpload
            label="Back cover (optional)"
            value={form.backImage}
            onChange={(url) => update("backImage", url)}
            folder="yoruba_calendar/books/covers"
            hint="Photo of the book back"
          />
        </div>
      </div>

      <fieldset className="space-y-3 border rounded-lg p-4">
        <legend className="text-sm font-medium px-1">Fulfillment options</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.allowsDelivery}
            onChange={(e) => update("allowsDelivery", e.target.checked)}
            className="accent-orange-500"
          />
          Offer home delivery
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.allowsPickup}
            onChange={(e) => update("allowsPickup", e.target.checked)}
            className="accent-orange-500"
          />
          Offer pick up in person
        </label>
        {form.allowsPickup && (
          <div className="space-y-1 pt-1">
            <Label htmlFor="pickupLocation">Pickup location</Label>
            <Input
              id="pickupLocation"
              value={form.pickupLocation}
              onChange={(e) => update("pickupLocation", e.target.value)}
              placeholder="e.g. Ibadan Cultural Centre, Oyo State"
            />
          </div>
        )}
      </fieldset>

      <div className="space-y-1">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(v) => update("status", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {loading ? "Saving…" : mode === "create" ? "List Book" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/books")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
