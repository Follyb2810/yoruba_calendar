import crypto from "crypto";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { ticketOrderService } from "@/module/Festival/ticketOrder.service";

export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return hash === signature;
}

/** Complete a paid order from Paystack reference (idempotent). */
export async function resolvePaystackReference(reference: string): Promise<{
  orderType: "book" | "ticket" | null;
  completed: boolean;
}> {
  if (reference.startsWith("BOOK_")) {
    const result = await bookOrderService.completePaidOrder(reference);
    return { orderType: "book", completed: !!result };
  }

  if (reference.startsWith("TICKET_")) {
    const result = await ticketOrderService.completePaidOrder(reference);
    return { orderType: "ticket", completed: !!result };
  }

  return { orderType: null, completed: false };
}

export async function failPaystackReference(reference: string): Promise<void> {
  if (reference.startsWith("BOOK_")) {
    await bookOrderService.failOrder(reference);
    return;
  }
  if (reference.startsWith("TICKET_")) {
    await ticketOrderService.failOrder(reference);
  }
}
