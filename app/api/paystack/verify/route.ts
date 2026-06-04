import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma-client";
import { verifyPaystackPayment } from "@/utils/paystack";
import { jsonError } from "@/utils/api-response";

// GET /api/paystack/verify?reference=xxx
export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference) {
    return jsonError("Payment reference is required", 400);
  }

  try {
    const order = await prisma.bookOrder.findUnique({
      where: { paystackReference: reference },
      include: { book: true },
    });

    if (!order) {
      return jsonError("Order not found", 404);
    }

    if (order.status === "SUCCESS") {
      return NextResponse.json({
        status: "success",
        book: { id: order.book.id, title: order.book.title },
        reference,
      });
    }

    const verification = await verifyPaystackPayment(reference);

    if (verification.status === "success") {
      await prisma.$transaction([
        prisma.bookOrder.update({
          where: { id: order.id },
          data: { status: "SUCCESS" },
        }),
        prisma.book.update({
          where: { id: order.bookId },
          data: { stock: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({
        status: "success",
        book: { id: order.book.id, title: order.book.title },
        reference,
      });
    }

    await prisma.bookOrder.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });

    return NextResponse.json({
      status: "failed",
      reference,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return jsonError(message, 400);
  }
}
