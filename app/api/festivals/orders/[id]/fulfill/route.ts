import { NextResponse } from "next/server";
import { ticketOrderService } from "@/module/Festival/ticketOrder.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/festivals/orders/[id]/fulfill — organizer marks ticket honored / event served
export async function POST(_req: Request, context: RouteContext) {
  const { session, error } = await requireCreator();
  if (error) return error;

  const { id } = await context.params;
  const orderId = Number(id);

  if (!Number.isFinite(orderId)) {
    return jsonError("Invalid order id", 400);
  }

  try {
    const order = await ticketOrderService.fulfillOrder(orderId, session!.user);
    return NextResponse.json({ order, message: "Order marked as fulfilled" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fulfill order";
    return jsonError(message, 400);
  }
}
