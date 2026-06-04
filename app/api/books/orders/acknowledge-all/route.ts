import { NextResponse } from "next/server";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

// POST /api/books/orders/acknowledge-all
export async function POST() {
  const { session, error } = await requireCreator();
  if (error) return error;

  try {
    const count = await bookOrderService.acknowledgeAll(session!.user);
    return NextResponse.json({ count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to acknowledge orders";
    return jsonError(message, 400);
  }
}
