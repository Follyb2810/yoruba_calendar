import { prisma } from "@/utils/prisma-client";
import { FestivalStatus, OrderStatus } from "@/generated/prisma";
import { isAdmin } from "@/utils/rbac";
import { isFestivalEnded } from "@/utils/formatDate";
import {
  serializeTicketOrder,
  type SerializedTicketOrder,
} from "@/utils/serializeTicketOrder";
import { notifyTicketOrderSuccess } from "@/utils/order-notifications";
import { generateReference } from "@/utils/paystack";
import { payoutService } from "@/module/Payout/payout.service";

const orderInclude = {
  ticket: {
    select: { id: true, name: true, type: true, isFree: true },
  },
  festival: {
    select: {
      id: true,
      title: true,
      startDate: true,
      location: true,
      country: true,
      userId: true,
      status: true,
      endDate: true,
    },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
} as const;

export class TicketOrderService {
  private db = prisma;

  private organizerFilter(user: { id: string; roles: string[] }) {
    if (isAdmin(user)) return {};
    return { festival: { userId: user.id } };
  }

  async validateTicketPurchase(ticketId: number, quantity: number) {
    const ticket = await this.db.ticket.findUnique({
      where: { id: ticketId },
      include: {
        festival: {
          select: {
            id: true,
            title: true,
            status: true,
            endDate: true,
            userId: true,
          },
        },
      },
    });

    if (!ticket) throw new Error("Ticket not found");

    if (ticket.festival.status !== FestivalStatus.PUBLISHED) {
      throw new Error("This event is not available");
    }

    if (isFestivalEnded(ticket.festival.endDate)) {
      throw new Error("This event has ended");
    }

    const remaining = ticket.quantity - ticket.sold;
    if (remaining < quantity) {
      throw new Error(`Only ${remaining} ticket(s) remaining`);
    }

    if (ticket.type === "single" && quantity !== 1) {
      throw new Error("This ticket allows quantity of 1 only");
    }

    if (
      ticket.type === "group" &&
      ticket.maxPerGroup &&
      quantity > ticket.maxPerGroup
    ) {
      throw new Error(`Maximum ${ticket.maxPerGroup} ticket(s) per order`);
    }

    if (!ticket.isFree && (!ticket.price || ticket.price <= 0)) {
      throw new Error("Ticket price is not configured");
    }

    return ticket;
  }

  async createPendingPaidOrder(
    ticketId: number,
    quantity: number,
    userId: string,
    buyerPhone?: string
  ) {
    const ticket = await this.validateTicketPurchase(ticketId, quantity);

    if (ticket.isFree) {
      throw new Error("Use free reservation for free tickets");
    }

    const amountKobo = Math.round(ticket.price! * quantity * 100);
    const reference = generateReference("TICKET");

    const order = await this.db.ticketOrder.create({
      data: {
        ticketId: ticket.id,
        festivalId: ticket.festivalId,
        userId,
        quantity,
        amount: amountKobo,
        paystackReference: reference,
        status: "PENDING",
        buyerPhone: buyerPhone?.trim() || null,
      },
      include: orderInclude,
    });

    return { order: serializeTicketOrder(order), reference, amountKobo, ticket };
  }

  async reserveFreeTicket(
    ticketId: number,
    quantity: number,
    userId: string,
    buyerPhone?: string
  ): Promise<SerializedTicketOrder> {
    const ticket = await this.validateTicketPurchase(ticketId, quantity);

    if (!ticket.isFree) {
      throw new Error("This ticket requires payment");
    }

    const reference = generateReference("FREE");

    const order = await this.db.$transaction(async (tx) => {
      const fresh = await tx.ticket.findUnique({ where: { id: ticketId } });
      if (!fresh || fresh.quantity - fresh.sold < quantity) {
        throw new Error("Not enough tickets available");
      }

      await tx.ticket.update({
        where: { id: ticketId },
        data: { sold: { increment: quantity } },
      });

      return tx.ticketOrder.create({
        data: {
          ticketId,
          festivalId: ticket.festivalId,
          userId,
          quantity,
          amount: 0,
          paystackReference: reference,
          status: "SUCCESS",
          buyerPhone: buyerPhone?.trim() || null,
        },
        include: orderInclude,
      });
    });

    notifyTicketOrderSuccess(order.id).catch(console.error);

    return serializeTicketOrder(order);
  }

  async completePaidOrder(reference: string): Promise<SerializedTicketOrder | null> {
    const order = await this.db.ticketOrder.findUnique({
      where: { paystackReference: reference },
      include: orderInclude,
    });

    if (!order) return null;

    if (order.status === "SUCCESS") {
      return serializeTicketOrder(order);
    }

    await this.db.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({ where: { id: order.ticketId } });
      if (!ticket || ticket.quantity - ticket.sold < order.quantity) {
        throw new Error("Not enough tickets available");
      }

      await tx.ticketOrder.update({
        where: { id: order.id },
        data: { status: "SUCCESS" },
      });

      await tx.ticket.update({
        where: { id: order.ticketId },
        data: { sold: { increment: order.quantity } },
      });
    });

    notifyTicketOrderSuccess(order.id).catch(console.error);

    const updated = await this.db.ticketOrder.findUniqueOrThrow({
      where: { id: order.id },
      include: orderInclude,
    });

    return serializeTicketOrder(updated);
  }

  async failOrder(reference: string): Promise<void> {
    await this.db.ticketOrder.updateMany({
      where: { paystackReference: reference, status: "PENDING" },
      data: { status: "FAILED" },
    });
  }

  async listOrders(
    user: { id: string; roles: string[] },
    status?: OrderStatus
  ): Promise<SerializedTicketOrder[]> {
    const orders = await this.db.ticketOrder.findMany({
      where: {
        ...this.organizerFilter(user),
        ...(status ? { status } : {}),
      },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });

    return orders.map(serializeTicketOrder);
  }

  async getUnreadCount(user: { id: string; roles: string[] }): Promise<number> {
    return this.db.ticketOrder.count({
      where: {
        ...this.organizerFilter(user),
        status: "SUCCESS",
        sellerAcknowledgedAt: null,
      },
    });
  }

  async acknowledgeOrder(
    orderId: number,
    user: { id: string; roles: string[] }
  ): Promise<SerializedTicketOrder> {
    const order = await this.db.ticketOrder.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) throw new Error("Order not found");

    const canManage =
      isAdmin(user) || order.festival.userId === user.id;

    if (!canManage) throw new Error("You are not allowed to manage this order");

    const updated = await this.db.ticketOrder.update({
      where: { id: orderId },
      data: { sellerAcknowledgedAt: new Date() },
      include: orderInclude,
    });

    return serializeTicketOrder(updated);
  }

  async acknowledgeAll(user: { id: string; roles: string[] }): Promise<number> {
    const { count } = await this.db.ticketOrder.updateMany({
      where: {
        ...this.organizerFilter(user),
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
  ): Promise<SerializedTicketOrder> {
    const order = await this.db.ticketOrder.findUnique({
      where: { id: orderId },
      include: orderInclude,
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== "SUCCESS") {
      throw new Error("Only paid orders can be marked fulfilled");
    }
    if (order.fulfilledAt) throw new Error("Order is already fulfilled");

    const canManage =
      isAdmin(user) || order.festival.userId === user.id;

    if (!canManage) throw new Error("You are not allowed to manage this order");

    const feedbackToken = payoutService.createFeedbackToken();

    const updated = await this.db.ticketOrder.update({
      where: { id: orderId },
      data: { fulfilledAt: new Date(), feedbackToken },
      include: orderInclude,
    });

    const { notifyTicketOrderFulfilled } = await import("@/utils/order-notifications");
    notifyTicketOrderFulfilled(orderId).catch(console.error);

    payoutService.payoutTicketOrder(orderId).catch(console.error);

    return serializeTicketOrder(updated);
  }
}

export const ticketOrderService = new TicketOrderService();
