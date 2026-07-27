import { NextRequest, NextResponse } from "next/server";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { requireSession } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";
import { initializePaystackPayment } from "@/utils/paystack";
import { z } from "zod";

const paySchema = z.object({
  paymentToken: z.string().min(1),
});

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  );
}

// POST /api/books/orders/pay — buyer confirms receipt and starts Paystack
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = paySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Payment token is required", 400);
    }

    const { reference, amountKobo, email, bookTitle } =
      await bookOrderService.initializeBuyerPayment(
        parsed.data.paymentToken,
        session!.user.id
      );

    const baseUrl = getBaseUrl();

    const payment = await initializePaystackPayment({
      email,
      amountKobo,
      reference,
      callbackUrl: `${baseUrl}/books/payment/verify?reference=${reference}`,
      metadata: {
        orderType: "book",
        bookTitle,
        userId: session!.user.id,
      },
    });

    return NextResponse.json({
      authorization_url: payment.authorization_url,
      reference: payment.reference,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment initialization failed";
    return jsonError(message, 400);
  }
}
