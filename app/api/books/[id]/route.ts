import { NextRequest, NextResponse } from "next/server";
import { BookStatus } from "@/generated/prisma";
import { auth } from "@/utils/auth";
import { requireCreator } from "@/utils/requireRole";
import { canManageResource } from "@/utils/rbac";
import { bookService } from "@/module/Book/book.service";
import { updateBookSchema } from "@/helpers/zod/book.schema";
import { jsonError, jsonNotFound } from "@/utils/api-response";
import { serializeBook } from "@/utils/serializeBook";

// GET /api/books/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const book = await bookService.getBookById(Number(id));
    const session = await auth();

    const canView =
      book.status === BookStatus.PUBLISHED ||
      (session?.user &&
        canManageResource(
          { id: session.user.id, roles: session.user.roles ?? [] },
          book.userId
        ));

    if (!canView) return jsonNotFound("Book not found");

    return NextResponse.json({ book: serializeBook(book) });
  } catch {
    return jsonNotFound("Book not found");
  }
}

// PATCH /api/books/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireCreator();
  if (error) return error;

  const { id } = await params;
  const user = { id: session!.user.id, roles: session!.user.roles ?? [] };

  try {
    const body = await req.json();

    if (body.action === "publish") {
      const book = await bookService.setBookStatus(
        Number(id),
        BookStatus.PUBLISHED,
        user
      );
      return NextResponse.json({ book });
    }

    if (body.action === "unpublish") {
      const book = await bookService.setBookStatus(
        Number(id),
        BookStatus.DRAFT,
        user
      );
      return NextResponse.json({ book });
    }

    const parsed = updateBookSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const book = await bookService.updateBook(Number(id), parsed.data, user);
    return NextResponse.json({ book });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update book";
    return jsonError(message, 400);
  }
}

// DELETE /api/books/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireCreator();
  if (error) return error;

  const { id } = await params;

  try {
    await bookService.deleteBook(Number(id), {
      id: session!.user.id,
      roles: session!.user.roles ?? [],
    });
    return NextResponse.json({ message: "Book deleted" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete book";
    return jsonError(message, 400);
  }
}
