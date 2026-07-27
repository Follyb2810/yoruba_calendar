import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import { verifyPaystackPayment } from "@/utils/paystack";
import { jsonError } from "@/utils/api-response";
import { fulfillmentLabel } from "@/utils/serializeBook";
import { bookOrderService } from "@/module/Book/bookOrder.service";
import { ticketOrderService } from "@/module/Festival/ticketOrder.service";

function bookPayload(order: {
  fulfillmentMethod: "DELIVERY" | "PICKUP";
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryPhone: string | null;
  pickupLocation: string | null;
  book: { id: number; title: string };
  paystackReference: string | null;
}) {
  return {
    orderType: "book" as const,
    status: "success" as const,
    book: { id: order.book.id, title: order.book.title },
    reference: order.paystackReference,
    fulfillment: {
      method: order.fulfillmentMethod,
      label: fulfillmentLabel(order.fulfillmentMethod),
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryPhone: order.deliveryPhone,
      pickupLocation: order.pickupLocation,
    },
  };
}

function ticketPayload(order: {
  quantity: number;
  paystackReference: string;
  ticket: { id: number; name: string };
  festival: { id: number; title: string };
}) {
  return {
    orderType: "ticket" as const,
    status: "success" as const,
    reference: order.paystackReference,
    ticket: {
      id: order.ticket.id,
      name: order.ticket.name,
      quantity: order.quantity,
    },
    festival: {
      id: order.festival.id,
      title: order.festival.title,
    },
  };
}

// GET /api/paystack/verify?reference=xxx
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference) {
    return jsonError("Payment reference is required", 400);
  }

  try {
    const bookOrder = await prisma.bookOrder.findUnique({
      where: { paystackReference: reference },
      include: { book: true },
    });

    if (bookOrder) {
      if (bookOrder.status === "SUCCESS") {
        return NextResponse.json(bookPayload(bookOrder));
      }

      const verification = await verifyPaystackPayment(reference);

      if (verification.status === "success") {
        const completed = await bookOrderService.completePaidOrder(reference);
        if (!completed) return jsonError("Order not found", 404);

        const order = await prisma.bookOrder.findUniqueOrThrow({
          where: { paystackReference: reference },
          include: { book: true },
        });

        return NextResponse.json(bookPayload(order));
      }

      await bookOrderService.failOrder(reference);
      return NextResponse.json({ status: "failed", reference, orderType: "book" });
    }

    const ticketOrder = await prisma.ticketOrder.findUnique({
      where: { paystackReference: reference },
      include: { ticket: true, festival: true },
    });

    if (ticketOrder) {
      if (ticketOrder.status === "SUCCESS") {
        return NextResponse.json(ticketPayload(ticketOrder));
      }

      const verification = await verifyPaystackPayment(reference);

      if (verification.status === "success") {
        const completed = await ticketOrderService.completePaidOrder(reference);
        if (!completed) return jsonError("Order not found", 404);

        const order = await prisma.ticketOrder.findUniqueOrThrow({
          where: { paystackReference: reference },
          include: { ticket: true, festival: true },
        });

        return NextResponse.json(ticketPayload(order));
      }

      await ticketOrderService.failOrder(reference);
      return NextResponse.json({ status: "failed", reference, orderType: "ticket" });
    }

    return jsonError("Order not found", 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return jsonError(message, 400);
  }
}
