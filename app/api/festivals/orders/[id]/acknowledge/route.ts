import { NextResponse } from "next/server";
import { ticketOrderService } from "@/module/Festival/ticketOrder.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/festivals/orders/[id]/acknowledge
export async function PATCH(_req: Request, context: RouteContext) {
  const { session, error } = await requireCreator();
  if (error) return error;

  const { id } = await context.params;
  const orderId = Number(id);

  if (!Number.isFinite(orderId)) {
    return jsonError("Invalid order id", 400);
  }

  try {
    const order = await ticketOrderService.acknowledgeOrder(orderId, session!.user);
    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to acknowledge order";
    return jsonError(message, 400);
  }
}
