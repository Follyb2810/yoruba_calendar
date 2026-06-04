import { NextResponse } from "next/server";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { ticketOrderService } from "@/module/Festival/ticketOrder.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

// GET /api/festivals/orders/unread-count
export async function GET() {
  const { session, error } = await requireCreator();
  if (error) return error;

  try {
    const count = await ticketOrderService.getUnreadCount(session!.user);
    return NextResponse.json({ count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load count";
    return jsonError(message, 400);
  }
}
