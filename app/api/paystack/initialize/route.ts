import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import { requireSession } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";
import {
  generateReference,
  initializePaystackPayment,
  nairaToKobo,
} from "@/utils/paystack";
import { BookStatus, FulfillmentMethod } from "@/generated/prisma";
import { checkoutBookSchema } from "@/helpers/zod/book.schema";

// POST /api/paystack/initialize
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = checkoutBookSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid checkout", 400);
    }

    const { bookId, fulfillmentMethod, deliveryAddress, deliveryCity, deliveryPhone } =
      parsed.data;

    const book = await prisma.book.findUnique({ where: { id: bookId } });

    if (!book || book.status !== BookStatus.PUBLISHED) {
      return jsonError("Book not found", 404);
    }

    if (book.stock <= 0) {
      return jsonError("This book is out of stock", 400);
    }

    if (fulfillmentMethod === "DELIVERY" && !book.allowsDelivery) {
      return jsonError("This book is not available for delivery", 400);
    }

    if (fulfillmentMethod === "PICKUP" && !book.allowsPickup) {
      return jsonError("This book is not available for pickup", 400);
    }

    const reference = generateReference("BOOK");
    const amountKobo = nairaToKobo(book.price);
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3000";

    await prisma.bookOrder.create({
      data: {
        bookId: book.id,
        userId: session!.user.id,
        amount: amountKobo,
        paystackReference: reference,
        status: "PENDING",
        fulfillmentMethod: fulfillmentMethod as FulfillmentMethod,
        deliveryAddress:
          fulfillmentMethod === "DELIVERY" ? deliveryAddress!.trim() : null,
        deliveryCity:
          fulfillmentMethod === "DELIVERY" ? deliveryCity!.trim() : null,
        deliveryPhone:
          fulfillmentMethod === "DELIVERY" ? deliveryPhone!.trim() : null,
        pickupLocation:
          fulfillmentMethod === "PICKUP" ? book.pickupLocation : null,
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
        fulfillmentMethod,
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
