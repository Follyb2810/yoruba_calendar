import { NextRequest, NextResponse } from "next/server";
import { payoutService } from "@/module/Payout/payout.service";
import { requireCreator } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";

// POST /api/creator/payout-retry?type=book|ticket&orderId=1
export async function POST(req: NextRequest) {
  const { session, error } = await requireCreator();
  if (error) return error;

  const type = req.nextUrl.searchParams.get("type");
  const orderId = Number(req.nextUrl.searchParams.get("orderId"));

  if (type !== "book" && type !== "ticket") {
    return jsonError("type must be book or ticket", 400);
  }
  if (!Number.isFinite(orderId)) {
    return jsonError("orderId is required", 400);
  }

  try {
    await payoutService.retryPayout(type, orderId, session!.user.id);
    return NextResponse.json({ message: "Payout retry initiated" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Retry failed";
    return jsonError(message, 400);
  }
}
