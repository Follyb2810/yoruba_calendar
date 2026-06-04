import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import { requireSession } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";
import {
  generateReference,
  initializePaystackPayment,
  nairaToKobo,
} from "@/utils/paystack";
import { BookStatus } from "@/generated/prisma";

// POST /api/paystack/initialize { bookId: number }
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const { bookId } = await req.json();

    if (!bookId) {
      return jsonError("Book ID is required", 400);
    }

    const book = await prisma.book.findUnique({
      where: { id: Number(bookId) },
    });

    if (!book || book.status !== BookStatus.PUBLISHED) {
      return jsonError("Book not found", 404);
    }

    if (book.stock <= 0) {
      return jsonError("This book is out of stock", 400);
    }

    const reference = generateReference("BOOK");
    const amountKobo = nairaToKobo(book.price);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    await prisma.bookOrder.create({
      data: {
        bookId: book.id,
        userId: session!.user.id,
        amount: amountKobo,
        paystackReference: reference,
        status: "PENDING",
      },
    });

    const payment = await initializePaystackPayment({
      email: session!.user.email!,
      amountKobo,
      reference,
      callbackUrl: `${baseUrl}/books/payment/verify?reference=${reference}`,
      metadata: {
        bookId: book.id,
        bookTitle: book.title,
        userId: session!.user.id,
      },
    });

    return NextResponse.json({
      authorization_url: payment.authorization_url,
      reference: payment.reference,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Payment initialization failed";
    return jsonError(message, 400);
  }
}
