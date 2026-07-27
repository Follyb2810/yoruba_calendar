import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/utils/api-response";

// POST /api/paystack/initialize — deprecated for books; use POST /api/books/orders instead
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.bookId != null) {
      return jsonError(
        "Book checkout has moved to pay-on-receipt. Use POST /api/books/orders to place your order.",
        410
      );
    }
    return jsonError("Invalid checkout request", 400);
  } catch {
    return jsonError("Invalid checkout request", 400);
  }
}
