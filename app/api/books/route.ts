import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import { BookStatus } from "@/generated/prisma";
import { requireRole } from "@/utils/requireRole";
import { createBookSchema } from "@/helpers/zod/book.schema";
import { jsonError, jsonServerError } from "@/utils/api-response";
import { serializeBook } from "@/utils/serializeBook";

// GET /api/books?search=
export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") ?? "";

  try {
    const books = await prisma.book.findMany({
      where: {
        status: BookStatus.PUBLISHED,
        ...(search ? { title: { contains: search } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ books: books.map(serializeBook) });
  } catch {
    return jsonServerError("Failed to fetch books");
  }
}

// POST /api/books — admin only
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["ADMIN", "SUPERADMIN"]);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = createBookSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const book = await prisma.book.create({
      data: {
        ...parsed.data,
        coverImage: parsed.data.coverImage || null,
        userId: session!.user.id,
      },
    });

    return NextResponse.json({ book: serializeBook(book) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create book";
    return jsonError(message, 400);
  }
}
