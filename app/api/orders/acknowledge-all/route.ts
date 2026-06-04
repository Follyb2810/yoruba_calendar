import { NextResponse } from "next/server";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { ticketOrderService } from "@/module/Festival/ticketOrder.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

// POST /api/orders/acknowledge-all
export async function POST() {
  const { session, error } = await requireCreator();
  if (error) return error;

  try {
    const [books, tickets] = await Promise.all([
      bookOrderService.acknowledgeAll(session!.user),
      ticketOrderService.acknowledgeAll(session!.user),
    ]);

    return NextResponse.json({ count: books + tickets, books, tickets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to acknowledge orders";
    return jsonError(message, 400);
  }
}
