import { prisma } from "@/utils/prisma-client";
import { BookStatus, OrderStatus } from "@/generated/prisma";
import { isAdmin } from "@/utils/rbac";
import {
  serializeBookOrder,
  type SerializedBookOrder,
} from "@/utils/serializeBookOrder";
import {
  notifyBookOrderPlaced,
  notifyBookOrderReadyForPayment,
  notifyBookOrderSuccess,
} from "@/utils/order-notifications";
import { payoutService } from "@/module/Payout/payout.service";
import { generateReference, generateFeedbackToken, nairaToKobo } from "@/utils/paystack";
import type { CheckoutBookInput } from "@/helpers/zod/book.schema";

const orderInclude = {
  book: {
    select: {
      id: true,
      title: true,
      author: true,
      coverImage: true,
      userId: true,
      price: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export class BookOrderService {
  private db = prisma;

  private sellerFilter(user: { id: string; roles: string[] }) {
    if (isAdmin(user)) return {};
    return { book: { userId: user.id } };
  }

  async listOrders(
    user: { id: string; roles: string[] },
    status?: OrderStatus
  ): Promise<SerializedBookOrder[]> {
    const orders = await this.db.bookOrder.findMany({
      where: {
        ...this.sellerFilter(user),
        ...(status ? { status } : {}),
      },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });

    return orders.map(serializeBookOrder);
  }

  async getUnreadCount(user: { id: string; roles: string[] }): Promise<number> {
    return this.db.bookOrder.count({
      where: {
        ...this.sellerFilter(user),
        status: { in: ["ORDERED", "AWAITING_PAYMENT", "SUCCESS"] },
        sellerAcknowledgedAt: null,
      },
    });
  }

  async acknowledgeOrder(
    orderId: number,
    user: { id: string; roles: string[] }
  ): Promise<SerializedBookOrder> {
    const order = await this.db.bookOrder.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) throw new Error("Order not found");

    const canManage = isAdmin(user) || order.book.userId === user.id;
    if (!canManage) throw new Error("You are not allowed to manage this order");

    const updated = await this.db.bookOrder.update({
      where: { id: orderId },
      data: { sellerAcknowledgedAt: new Date() },
      include: orderInclude,
    });

    return serializeBookOrder(updated);
  }

  async acknowledgeAll(user: { id: string; roles: string[] }): Promise<number> {
    const { count } = await this.db.bookOrder.updateMany({
      where: {
        ...this.sellerFilter(user),
        status: { in: ["ORDERED", "AWAITING_PAYMENT", "SUCCESS"] },
        sellerAcknowledgedAt: null,
      },
      data: { sellerAcknowledgedAt: new Date() },
    });

    return count;
  }

  /** Step 1: Buyer places order — no payment yet */
  async placeOrder(input: CheckoutBookInput, userId: string): Promise<SerializedBookOrder> {
    const book = await this.db.book.findUnique({ where: { id: input.bookId } });

    if (!book || book.status !== BookStatus.PUBLISHED) {
      throw new Error("Book not found");
    }
    if (book.stock <= 0) throw new Error("This book is out of stock");

    const paymentToken = generateFeedbackToken();

    const order = await this.db.bookOrder.create({
      data: {
        bookId: book.id,
        userId,
        amount: nairaToKobo(book.price),
        status: "ORDERED",
        paymentToken,
        fulfillmentMethod: input.fulfillmentMethod,
        deliveryAddress:
          input.fulfillmentMethod === "DELIVERY" ? input.deliveryAddress!.trim() : null,
        deliveryCity:
          input.fulfillmentMethod === "DELIVERY" ? input.deliveryCity!.trim() : null,
        deliveryPhone:
          input.fulfillmentMethod === "DELIVERY" ? input.deliveryPhone!.trim() : null,
        pickupLocation:
          input.fulfillmentMethod === "PICKUP" ? book.pickupLocation : null,
      },
      include: orderInclude,
    });

    notifyBookOrderPlaced(order.id).catch(console.error);

    return serializeBookOrder(order);
  }

  /** Step 2: Seller marks book sent / ready for pickup */
  async markReadyForBuyer(
    orderId: number,
    user: { id: string; roles: string[] }
  ): Promise<SerializedBookOrder> {
    const order = await this.db.bookOrder.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== "ORDERED") {
      throw new Error("Only new orders can be marked ready");
    }

    const canManage = isAdmin(user) || order.book.userId === user.id;
    if (!canManage) throw new Error("You are not allowed to manage this order");

    const updated = await this.db.bookOrder.update({
      where: { id: orderId },
      data: {
        status: "AWAITING_PAYMENT",
        fulfilledAt: new Date(),
        feedbackToken: payoutService.createFeedbackToken(),
      },
      include: orderInclude,
    });

    notifyBookOrderReadyForPayment(orderId).catch(console.error);

    return serializeBookOrder(updated);
  }

  /** Step 3: Buyer starts Paystack after receiving the book */
  async initializeBuyerPayment(paymentToken: string, userId: string) {
    const order = await this.db.bookOrder.findUnique({
      where: { paymentToken },
      include: { book: true, user: true },
    });

    if (!order) throw new Error("Order not found");
    if (order.userId !== userId) throw new Error("This order is not yours");
    if (order.status !== "AWAITING_PAYMENT") {
      throw new Error("This order is not ready for payment");
    }

    const book = await this.db.book.findUnique({ where: { id: order.bookId } });
    if (!book || book.stock <= 0) throw new Error("This book is out of stock");

    const reference = generateReference("BOOK");

    await this.db.bookOrder.update({
      where: { id: order.id },
      data: { paystackReference: reference, status: "PENDING" },
    });

    return {
      reference,
      amountKobo: order.amount,
      email: order.user.email,
      bookTitle: order.book.title,
    };
  }

  async getOrderByPaymentToken(token: string, userId: string) {
    const order = await this.db.bookOrder.findUnique({
      where: { paymentToken: token },
      include: { book: { select: { title: true, price: true, coverImage: true } } },
    });
    if (!order) return null;
    if (order.userId !== userId) throw new Error("This order is not yours");
    return {
      id: order.id,
      status: order.status,
      bookTitle: order.book.title,
      coverImage: order.book.coverImage,
      price: order.book.price,
      fulfillmentMethod: order.fulfillmentMethod,
    };
  }

  async completePaidOrder(reference: string): Promise<SerializedBookOrder | null> {
    const order = await this.db.bookOrder.findUnique({
      where: { paystackReference: reference },
      include: orderInclude,
    });

    if (!order) return null;

    if (order.status === "SUCCESS") {
      return serializeBookOrder(order);
    }

    const book = await this.db.book.findUnique({ where: { id: order.bookId } });
    if (!book || book.stock <= 0) {
      throw new Error("Book is out of stock");
    }

    await this.db.$transaction([
      this.db.bookOrder.update({
        where: { id: order.id },
        data: {
          status: "SUCCESS",
          buyerConfirmedAt: new Date(),
        },
      }),
      this.db.book.update({
        where: { id: order.bookId },
        data: { stock: { decrement: 1 } },
      }),
    ]);

    notifyBookOrderSuccess(order.id).catch(console.error);
    payoutService.payoutBookOrder(order.id).catch(console.error);

    const updated = await this.db.bookOrder.findUniqueOrThrow({
      where: { id: order.id },
      include: orderInclude,
    });

    return serializeBookOrder(updated);
  }

  async failOrder(reference: string): Promise<void> {
    const order = await this.db.bookOrder.findFirst({
      where: { paystackReference: reference, status: "PENDING" },
    });
    if (!order) return;

    await this.db.bookOrder.update({
      where: { id: order.id },
      data: { status: "AWAITING_PAYMENT", paystackReference: null },
    });
  }

  /** @deprecated use markReadyForBuyer */
  async fulfillOrder(
    orderId: number,
    user: { id: string; roles: string[] }
  ): Promise<SerializedBookOrder> {
    return this.markReadyForBuyer(orderId, user);
  }
}

export const bookOrderService = new BookOrderService();
