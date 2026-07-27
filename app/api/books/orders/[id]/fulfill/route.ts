import { NextResponse } from "next/server";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/books/orders/[id]/fulfill — seller marks book delivered / picked up
export async function POST(_req: Request, context: RouteContext) {
  const { session, error } = await requireCreator();
  if (error) return error;

  const { id } = await context.params;
  const orderId = Number(id);

  if (!Number.isFinite(orderId)) {
    return jsonError("Invalid order id", 400);
  }

  try {
    const order = await bookOrderService.fulfillOrder(orderId, session!.user);
    return NextResponse.json({ order, message: "Order marked ready — buyer notified to pay" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fulfill order";
    return jsonError(message, 400);
  }
}
