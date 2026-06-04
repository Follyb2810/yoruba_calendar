"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira, type SerializedBook } from "@/utils/serializeBook";
import { isAdmin } from "@/utils/rbac";
import {
  BookOpen,
  Edit,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";

export default function CreatorBookList() {
  const router = useRouter();
  const { data: session } = useSession();
  const admin = isAdmin(session?.user);
  const [books, setBooks] = useState<SerializedBook[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBooks() {
    try {
      const url = admin ? "/api/books?admin=true" : "/api/books?mine=true";
      const res = await fetch(url, { cache: "no-store" });
      if (res.status === 403) {
        router.replace("/dashboard/become-creator");
        return;
      }
      if (!res.ok) throw new Error("Failed to load books");
      const data = await res.json();
      setBooks(data.books);
    } catch {
      toast.error("Could not load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, [admin]);

  async function togglePublish(book: SerializedBook) {
    const action = book.status === "PUBLISHED" ? "unpublish" : "publish";
    const res = await fetch(`/api/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(action === "publish" ? "Book published" : "Book unpublished");
    loadBooks();
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete book");
      return;
    }
    toast.success("Book deleted");
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) {
    return <p className="text-muted-foreground py-12 text-center">Loading books…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {admin ? "All Books" : "My Books"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload covers via Cloudinary and publish to the shop
          </p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Link href="/dashboard/books/new">
            <Plus className="h-4 w-4" />
            Add Book
          </Link>
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/20">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No books yet</p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/dashboard/books/new">Add your first book</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Book</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Price</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Stock</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {book.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverImage}
                          alt=""
                          className="h-12 w-9 object-cover rounded border"
                        />
                      ) : (
                        <div className="h-12 w-9 rounded border bg-muted flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium line-clamp-1">{book.title}</div>
                        <div className="text-xs text-muted-foreground">{book.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell">{formatNaira(book.price)}</td>
                  <td className="p-3 hidden md:table-cell">{book.stock}</td>
                  <td className="p-3">
                    <Badge variant={book.status === "PUBLISHED" ? "default" : "outline"}>
                      {book.status === "PUBLISHED" ? "Live" : "Draft"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      {book.status === "PUBLISHED" && (
                        <Button variant="ghost" size="icon" asChild title="View in shop">
                          <Link href={`/books/${book.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link href={`/dashboard/books/${book.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs hidden lg:inline-flex"
                        onClick={() => togglePublish(book)}
                      >
                        {book.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(book.id, book.title)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
