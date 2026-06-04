import { prisma } from "@/utils/prisma-client";
import { PayoutStatus } from "@/generated/prisma";
import {
  calculateCreatorPayout,
  createTransferRecipient,
  generateFeedbackToken,
  generateReference,
  initiatePaystackTransfer,
} from "@/utils/paystack";
import type { PayoutAccountInput } from "@/helpers/zod/payout.schema";

export class PayoutService {
  private db = prisma;

  async saveCreatorPayoutAccount(userId: string, input: PayoutAccountInput) {
    const recipient = await createTransferRecipient({
      name: input.accountName,
      accountNumber: input.accountNumber,
      bankCode: input.bankCode,
    });

    const banks = await import("@/utils/paystack").then((m) => m.listPaystackBanks());
    const bank = banks.find((b) => b.code === input.bankCode);

    await this.db.user.update({
      where: { id: userId },
      data: {
        paystackRecipientCode: recipient.recipient_code,
        payoutBankCode: input.bankCode,
        payoutBankName: bank?.name ?? recipient.details.bank_name,
        payoutAccountName: input.accountName,
        payoutAccountLast4: input.accountNumber.slice(-4),
      },
    });

    return {
      bankName: bank?.name ?? recipient.details.bank_name,
      accountLast4: input.accountNumber.slice(-4),
      accountName: input.accountName,
    };
  }

  async getCreatorPayoutAccount(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        paystackRecipientCode: true,
        payoutBankName: true,
        payoutAccountName: true,
        payoutAccountLast4: true,
      },
    });

    if (!user?.paystackRecipientCode) return null;

    return {
      configured: true,
      bankName: user.payoutBankName,
      accountName: user.payoutAccountName,
      accountLast4: user.payoutAccountLast4,
    };
  }

  /** Pay creator when a book order is fulfilled. */
  async payoutBookOrder(orderId: number): Promise<void> {
    const order = await this.db.bookOrder.findUnique({
      where: { id: orderId },
      include: { book: { select: { userId: true, title: true } } },
    });

    if (!order || !order.fulfilledAt || order.amount <= 0) return;
    if (order.payoutStatus === "COMPLETED" || order.payoutStatus === "PROCESSING") return;

    await this.transferToCreator({
      creatorId: order.book.userId,
      amountKobo: order.amount,
      reason: `Book sale: ${order.book.title}`,
      orderType: "book",
      orderId,
    });
  }

  /** Pay organizer when a ticket order is fulfilled. */
  async payoutTicketOrder(orderId: number): Promise<void> {
    const order = await this.db.ticketOrder.findUnique({
      where: { id: orderId },
      include: { festival: { select: { userId: true, title: true } } },
    });

    if (!order || !order.fulfilledAt || order.amount <= 0) {
      if (order && order.amount <= 0) {
        await this.db.ticketOrder.update({
          where: { id: orderId },
          data: { payoutStatus: "SKIPPED" },
        });
      }
      return;
    }

    if (order.payoutStatus === "COMPLETED" || order.payoutStatus === "PROCESSING") return;

    await this.transferToCreator({
      creatorId: order.festival.userId,
      amountKobo: order.amount,
      reason: `Ticket sale: ${order.festival.title}`,
      orderType: "ticket",
      orderId,
    });
  }

  private async transferToCreator(params: {
    creatorId: string;
    amountKobo: number;
    reason: string;
    orderType: "book" | "ticket";
    orderId: number;
  }) {
    const { creatorAmount, platformFee } = calculateCreatorPayout(params.amountKobo);

    const creator = await this.db.user.findUnique({
      where: { id: params.creatorId },
      select: { paystackRecipientCode: true, email: true },
    });

    const updateOrder = async (data: {
      payoutStatus: PayoutStatus;
      creatorPayoutAmount?: number;
      platformFeeAmount?: number;
      paystackTransferReference?: string;
      payoutCompletedAt?: Date;
    }) => {
      if (params.orderType === "book") {
        await this.db.bookOrder.update({ where: { id: params.orderId }, data });
      } else {
        await this.db.ticketOrder.update({ where: { id: params.orderId }, data });
      }
    };

    if (!creator?.paystackRecipientCode) {
      await updateOrder({
        payoutStatus: "PENDING",
        creatorPayoutAmount: creatorAmount,
        platformFeeAmount: platformFee,
      });
      console.warn(
        `[payout] Creator ${params.creatorId} has no bank account — payout pending`
      );
      return;
    }

    if (creatorAmount < 100) {
      await updateOrder({
        payoutStatus: "SKIPPED",
        creatorPayoutAmount: creatorAmount,
        platformFeeAmount: platformFee,
      });
      return;
    }

    const reference = generateReference("PAYOUT");

    try {
      await updateOrder({
        payoutStatus: "PROCESSING",
        creatorPayoutAmount: creatorAmount,
        platformFeeAmount: platformFee,
        paystackTransferReference: reference,
      });

      await initiatePaystackTransfer({
        amountKobo: creatorAmount,
        recipientCode: creator.paystackRecipientCode,
        reason: params.reason.slice(0, 100),
        reference,
      });
    } catch (err) {
      console.error("[payout] Transfer failed:", err);
      await updateOrder({ payoutStatus: "FAILED" });
    }
  }

  async markTransferComplete(transferReference: string): Promise<void> {
    const book = await this.db.bookOrder.findFirst({
      where: { paystackTransferReference: transferReference },
    });
    if (book) {
      await this.db.bookOrder.update({
        where: { id: book.id },
        data: { payoutStatus: "COMPLETED", payoutCompletedAt: new Date() },
      });
      return;
    }

    const ticket = await this.db.ticketOrder.findFirst({
      where: { paystackTransferReference: transferReference },
    });
    if (ticket) {
      await this.db.ticketOrder.update({
        where: { id: ticket.id },
        data: { payoutStatus: "COMPLETED", payoutCompletedAt: new Date() },
      });
    }
  }

  async markTransferFailed(transferReference: string): Promise<void> {
    await this.db.bookOrder.updateMany({
      where: { paystackTransferReference: transferReference },
      data: { payoutStatus: "FAILED" },
    });
    await this.db.ticketOrder.updateMany({
      where: { paystackTransferReference: transferReference },
      data: { payoutStatus: "FAILED" },
    });
  }

  async retryPayout(orderType: "book" | "ticket", orderId: number, userId: string) {
    if (orderType === "book") {
      const order = await this.db.bookOrder.findUnique({
        where: { id: orderId },
        include: { book: true },
      });
      if (!order || order.book.userId !== userId) throw new Error("Order not found");
      if (order.payoutStatus === "COMPLETED") throw new Error("Already paid out");
      if (!order.fulfilledAt) throw new Error("Order must be fulfilled first");

      await this.db.bookOrder.update({
        where: { id: orderId },
        data: { payoutStatus: "PENDING", paystackTransferReference: null },
      });

      await this.payoutBookOrder(orderId);
      return;
    }

    const order = await this.db.ticketOrder.findUnique({
      where: { id: orderId },
      include: { festival: true },
    });
    if (!order || order.festival.userId !== userId) throw new Error("Order not found");
    if (order.payoutStatus === "COMPLETED") throw new Error("Already paid out");
    if (!order.fulfilledAt) throw new Error("Order must be fulfilled first");

    await this.db.ticketOrder.update({
      where: { id: orderId },
      data: { payoutStatus: "PENDING", paystackTransferReference: null },
    });

    await this.payoutTicketOrder(orderId);
  }

  createFeedbackToken(): string {
    return generateFeedbackToken();
  }
}

export const payoutService = new PayoutService();
