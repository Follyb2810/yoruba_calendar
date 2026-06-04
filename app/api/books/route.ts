import { NextRequest, NextResponse } from "next/server";
import { bookService } from "@/module/Book/book.service";
import { requireCreator, requireAdmin } from "@/utils/requireRole";
import { createBookSchema } from "@/helpers/zod/book.schema";
import { jsonError, jsonServerError } from "@/utils/api-response";

// GET /api/books?search=&mine=true&admin=true
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const mine = req.nextUrl.searchParams.get("mine") === "true";
  const adminAll = req.nextUrl.searchParams.get("admin") === "true";

  try {
    if (adminAll) {
      const { error } = await requireAdmin();
      if (error) return error;
      const books = await bookService.getAllBooks(search);
      return NextResponse.json({ books });
    }

    if (mine) {
      const { session, error } = await requireCreator();
      if (error) return error;
      const books = await bookService.getUserBooks(session!.user.id);
      return NextResponse.json({ books });
    }

    const books = await bookService.getPublicBooks(search);
    return NextResponse.json({ books });
  } catch {
    return jsonServerError("Failed to fetch books");
  }
}

// POST /api/books — creators only
export async function POST(req: NextRequest) {
  const { session, error } = await requireCreator();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = createBookSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const book = await bookService.createBook(parsed.data, session!.user.id);
    return NextResponse.json({ book }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create book";
    return jsonError(message, 400);
  }
}
