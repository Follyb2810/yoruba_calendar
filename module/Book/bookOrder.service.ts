import { prisma } from "@/utils/prisma-client";
import { OrderStatus } from "@/generated/prisma";
import { isAdmin } from "@/utils/rbac";
import {
  serializeBookOrder,
  type SerializedBookOrder,
} from "@/utils/serializeBookOrder";
import { notifyBookOrderSuccess } from "@/utils/order-notifications";
import { payoutService } from "@/module/Payout/payout.service";

const orderInclude = {
  book: {
    select: {
      id: true,
      title: true,
      author: true,
      coverImage: true,
      userId: true,
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
        status: "SUCCESS",
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

    const canManage =
      isAdmin(user) || order.book.userId === user.id;

    if (!canManage) {
      throw new Error("You are not allowed to manage this order");
    }

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
        status: "SUCCESS",
        sellerAcknowledgedAt: null,
      },
      data: { sellerAcknowledgedAt: new Date() },
    });

    return count;
  }

  async fulfillOrder(
    orderId: number,
    user: { id: string; roles: string[] }
  ): Promise<SerializedBookOrder> {
    const order = await this.db.bookOrder.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== "SUCCESS") {
      throw new Error("Only paid orders can be marked fulfilled");
    }
    if (order.fulfilledAt) throw new Error("Order is already fulfilled");

    const canManage =
      isAdmin(user) || order.book.userId === user.id;

    if (!canManage) {
      throw new Error("You are not allowed to manage this order");
    }

    const feedbackToken = payoutService.createFeedbackToken();

    const updated = await this.db.bookOrder.update({
      where: { id: orderId },
      data: { fulfilledAt: new Date(), feedbackToken },
      include: orderInclude,
    });

    const { notifyBookOrderFulfilled } = await import("@/utils/order-notifications");
    notifyBookOrderFulfilled(orderId).catch(console.error);

    payoutService.payoutBookOrder(orderId).catch(console.error);

    return serializeBookOrder(updated);
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

    await this.db.$transaction([
      this.db.bookOrder.update({
        where: { id: order.id },
        data: { status: "SUCCESS" },
      }),
      this.db.book.update({
        where: { id: order.bookId },
        data: { stock: { decrement: 1 } },
      }),
    ]);

    notifyBookOrderSuccess(order.id).catch(console.error);

    const updated = await this.db.bookOrder.findUniqueOrThrow({
      where: { id: order.id },
      include: orderInclude,
    });

    return serializeBookOrder(updated);
  }

  async failOrder(reference: string): Promise<void> {
    await this.db.bookOrder.updateMany({
      where: { paystackReference: reference, status: "PENDING" },
      data: { status: "FAILED" },
    });
  }
}

export const bookOrderService = new BookOrderService();
