import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@/generated/prisma";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

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
