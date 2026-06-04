import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";
import { initializePaystackPayment } from "@/utils/paystack";
import { checkoutTicketSchema } from "@/helpers/zod/ticket.schema";
import { ticketOrderService } from "@/module/Festival/ticketOrder.service";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  );
}

// POST /api/paystack/tickets/initialize
export async function POST(req: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = checkoutTicketSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid checkout", 400);
    }

    const { ticketId, quantity, buyerPhone } = parsed.data;

    const { reference, amountKobo, ticket } =
      await ticketOrderService.createPendingPaidOrder(
        ticketId,
        quantity,
        session!.user.id,
        buyerPhone
      );

    const baseUrl = getBaseUrl();

    const payment = await initializePaystackPayment({
      email: session!.user.email!,
      amountKobo,
      reference,
      callbackUrl: `${baseUrl}/festivals/payment/verify?reference=${reference}`,
      metadata: {
        ticketId,
        festivalId: ticket.festivalId,
        festivalTitle: ticket.festival.title,
        userId: session!.user.id,
        quantity,
      },
    });

    return NextResponse.json({
      authorization_url: payment.authorization_url,
      reference: payment.reference,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Payment initialization failed";
    return jsonError(message, 400);
  }
}
