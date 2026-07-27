import { NextResponse } from "next/server";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { requireSession } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

type RouteContext = { params: Promise<{ token: string }> };

// GET /api/books/orders/pay/[token] — preview order for buyer payment
export async function GET(_req: Request, context: RouteContext) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { token } = await context.params;

  try {
    const order = await bookOrderService.getOrderByPaymentToken(token, session!.user.id);
    if (!order) return jsonError("Order not found", 404);

    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load order";
    return jsonError(message, 400);
  }
}
