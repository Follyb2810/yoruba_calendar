import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, BookStatus } from "@/generated/prisma";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { requireCreator, requireSession } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";
import { checkoutBookSchema } from "@/helpers/zod/book.schema";
import { prisma } from "@/utils/prisma-client";

// GET /api/books/orders?status=SUCCESS
export async function GET(req: NextRequest) {
  const { session, error } = await requireCreator();
  if (error) return error;

  const statusParam = req.nextUrl.searchParams.get("status");
  const status =
    statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
      ? (statusParam as OrderStatus)
      : undefined;

  try {
    const orders = await bookOrderService.listOrders(session!.user, status);
    return NextResponse.json({ orders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load orders";
    return jsonError(message, 400);
  }
}

// POST /api/books/orders — place order (pay on receipt)
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = checkoutBookSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid checkout", 400);
    }

    const { bookId, fulfillmentMethod } = parsed.data;

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

    const order = await bookOrderService.placeOrder(parsed.data, session!.user.id);

    return NextResponse.json({
      order,
      message: "Order placed. You'll pay after you receive the book.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place order";
    return jsonError(message, 400);
  }
}
