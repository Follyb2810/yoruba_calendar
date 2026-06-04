import { notFound } from "next/navigation";
import BackButton from "@/components/shared/BackButton";
import BookPurchasePanel from "@/components/books/BookPurchasePanel";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/utils/serializeBook";
import { getBaseUrl } from "@/utils/getBaseUrl";
import { BookOpen, Truck, MapPin } from "lucide-react";
import type { SerializedBook } from "@/utils/serializeBook";

async function getBook(id: string): Promise<SerializedBook | null> {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/books/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.book;
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) notFound();

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <BackButton />

      <div className="mt-4 grid md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center">
            {book.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.coverImage}
                alt={`${book.title} front cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="h-24 w-24 text-orange-300" />
            )}
          </div>
          {book.backImage && (
            <div className="aspect-[3/4] rounded-xl overflow-hidden border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.backImage}
                alt={`${book.title} back cover`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Cover photos · physical book
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline">
                {book.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
              <Badge variant="secondary">Physical book</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{book.title}</h1>
            <p className="text-muted-foreground mt-1">by {book.author}</p>
          </div>

          <p className="text-3xl font-bold text-orange-600">
            {formatNaira(book.price)}
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {book.allowsDelivery && (
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4" /> Delivery available
              </span>
            )}
            {book.allowsPickup && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Pickup available
              </span>
            )}
          </div>

          <p className="text-sm leading-relaxed text-gray-700">{book.description}</p>

          <BookPurchasePanel book={book} />
        </div>
      </div>
    </section>
  );
}
