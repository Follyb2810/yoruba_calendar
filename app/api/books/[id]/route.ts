import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import { BookStatus } from "@/generated/prisma";
import { jsonNotFound } from "@/utils/api-response";
import { serializeBook } from "@/utils/serializeBook";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const book = await prisma.book.findUnique({
      where: { id: Number(id) },
    });

    if (!book || book.status !== BookStatus.PUBLISHED) {
      return jsonNotFound("Book not found");
    }

    return NextResponse.json({ book: serializeBook(book) });
  } catch {
    return jsonNotFound("Book not found");
  }
}
