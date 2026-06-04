import { notFound } from "next/navigation";
import { headers } from "next/headers";
import BackButton from "@/components/shared/BackButton";
import BuyButton from "@/components/books/BuyButton";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/utils/serializeBook";
import { BookOpen } from "lucide-react";
import type { SerializedBook } from "@/utils/serializeBook";

async function getBook(id: string): Promise<SerializedBook | null> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/books/${id}`, { cache: "no-store" });
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
        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center">
          {book.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-24 w-24 text-orange-300" />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Badge variant="outline" className="mb-2">
              {book.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold">{book.title}</h1>
            <p className="text-muted-foreground mt-1">by {book.author}</p>
          </div>

          <p className="text-3xl font-bold text-orange-600">
            {formatNaira(book.price)}
          </p>

          <p className="text-sm leading-relaxed text-gray-700">{book.description}</p>

          <div className="pt-4 space-y-2">
            <BuyButton bookId={book.id} inStock={book.inStock} />
            <p className="text-xs text-muted-foreground text-center">
              Secure payment powered by Paystack
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
