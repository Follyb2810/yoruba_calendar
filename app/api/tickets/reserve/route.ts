import { NextResponse } from "next/server";
import { requireSession } from "@/utils/requireRole";
import { jsonError } from "@/utils/api-response";
import { reserveFreeTicketSchema } from "@/helpers/zod/ticket.schema";
import { ticketOrderService } from "@/module/Festival/ticketOrder.service";

// POST /api/tickets/reserve — free tickets only
export async function POST(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = reserveFreeTicketSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
    }

    const { ticketId, quantity, buyerPhone } = parsed.data;

    const order = await ticketOrderService.reserveFreeTicket(
      ticketId,
      quantity,
      session!.user.id,
      buyerPhone
    );

    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reservation failed";
    return jsonError(message, 400);
  }
}
