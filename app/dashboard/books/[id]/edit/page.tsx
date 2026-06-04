import { notFound } from "next/navigation";
import { headers } from "next/headers";
import BookForm from "@/components/dashboard/books/BookForm";
import type { SerializedBook } from "@/utils/serializeBook";

async function getBook(id: string): Promise<SerializedBook | null> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/books/${id}`, {
    cache: "no-store",
    headers: { cookie: headersList.get("cookie") ?? "" },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.book;
}

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) notFound();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Book</h1>
        <p className="text-sm text-muted-foreground mt-1">{book.title}</p>
      </div>
      <BookForm mode="edit" initial={book} />
    </section>
  );
}
