import { NextResponse } from "next/server";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { ticketOrderService } from "@/module/Festival/ticketOrder.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

// GET /api/orders/unread-count — combined book + ticket orders
export async function GET() {
  const { session, error } = await requireCreator();
  if (error) return error;

  try {
    const [books, tickets] = await Promise.all([
      bookOrderService.getUnreadCount(session!.user),
      ticketOrderService.getUnreadCount(session!.user),
    ]);

    return NextResponse.json({ count: books + tickets, books, tickets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load count";
    return jsonError(message, 400);
  }
}
