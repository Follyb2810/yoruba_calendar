import { NextResponse } from "next/server";
import { payoutService } from "@/module/Payout/payout.service";
import { requireCreator } from "@/utils/requireRole";
import { payoutAccountSchema } from "@/helpers/zod/payout.schema";
import { jsonError } from "@/utils/api-response";

// GET /api/creator/payout-account
export async function GET() {
  const { session, error } = await requireCreator();
  if (error) return error;

  const account = await payoutService.getCreatorPayoutAccount(session!.user.id);
  return NextResponse.json({ account });
}

// POST /api/creator/payout-account
export async function POST(req: Request) {
  const { session, error } = await requireCreator();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = payoutAccountSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const account = await payoutService.saveCreatorPayoutAccount(
      session!.user.id,
      parsed.data
    );

    return NextResponse.json({
      message: "Payout account saved. You will be paid when orders are fulfilled.",
      account,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save account";
    return jsonError(message, 400);
  }
}
