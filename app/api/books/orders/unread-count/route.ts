import { NextResponse } from "next/server";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

// GET /api/books/orders/unread-count
export async function GET() {
  const { session, error } = await requireCreator();
  if (error) return error;

  try {
    const count = await bookOrderService.getUnreadCount(session!.user);
    return NextResponse.json({ count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load count";
    return jsonError(message, 400);
  }
}
