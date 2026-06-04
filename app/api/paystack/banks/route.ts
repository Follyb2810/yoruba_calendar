import { NextResponse } from "next/server";
import { listPaystackBanks } from "@/utils/paystack";
import { jsonError } from "@/utils/api-response";

// GET /api/paystack/banks
export async function GET() {
  try {
    const banks = await listPaystackBanks();
    return NextResponse.json({ banks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load banks";
    return jsonError(message, 400);
  }
}
