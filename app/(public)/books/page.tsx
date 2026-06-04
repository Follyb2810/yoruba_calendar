"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/utils/serializeBook";
import { BookOpen, Search } from "lucide-react";

type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImage: string | null;
  inStock: boolean;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const q = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`/api/books${q}`);
        const data = await res.json();
        setBooks(data.books ?? []);
      } catch {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Book Shop</h1>
        <p className="text-muted-foreground mt-1">
          Yoruba culture, spirituality, and heritage — delivered to you
        </p>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search books…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-center py-16 text-muted-foreground">Loading books…</p>
      ) : books.length === 0 ? (
        <p className="text-center py-16 text-muted-foreground">No books available yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="group border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-orange-50 to-yellow-100 flex items-center justify-center overflow-hidden">
                {book.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <BookOpen className="h-16 w-16 text-orange-300" />
                )}
              </div>
              <div className="p-3 space-y-1">
                <h2 className="font-medium text-sm line-clamp-2 leading-snug">
                  {book.title}
                </h2>
                <p className="text-xs text-muted-foreground">{book.author}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-orange-600">
                    {formatNaira(book.price)}
                  </span>
                  {!book.inStock && (
                    <Badge variant="secondary" className="text-xs">
                      Sold out
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
