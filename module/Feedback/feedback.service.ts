import { prisma } from "@/utils/prisma-client";
import type { FeedbackInput } from "@/helpers/zod/payout.schema";
import { payoutService } from "@/module/Payout/payout.service";

export type FeedbackOrderPreview = {
  orderType: "book" | "ticket";
  title: string;
  subtitle: string;
  alreadySubmitted: boolean;
  rating: number | null;
};

export class FeedbackService {
  private db = prisma;

  async getByToken(token: string): Promise<FeedbackOrderPreview | null> {
    const book = await this.db.bookOrder.findUnique({
      where: { feedbackToken: token },
      include: { book: true },
    });

    if (book) {
      return {
        orderType: "book",
        title: book.book.title,
        subtitle: "Physical book order",
        alreadySubmitted: !!book.buyerFeedbackAt,
        rating: book.buyerRating,
      };
    }

    const ticket = await this.db.ticketOrder.findUnique({
      where: { feedbackToken: token },
      include: { festival: true, ticket: true },
    });

    if (ticket) {
      return {
        orderType: "ticket",
        title: ticket.festival.title,
        subtitle: ticket.ticket.name,
        alreadySubmitted: !!ticket.buyerFeedbackAt,
        rating: ticket.buyerRating,
      };
    }

    return null;
  }

  async submit(token: string, input: FeedbackInput): Promise<void> {
    const book = await this.db.bookOrder.findUnique({
      where: { feedbackToken: token },
    });

    if (book) {
      if (book.status !== "SUCCESS") throw new Error("Complete payment first");
      if (book.buyerFeedbackAt) throw new Error("Feedback already submitted");

      await this.db.bookOrder.update({
        where: { id: book.id },
        data: {
          buyerRating: input.rating,
          buyerComment: input.comment?.trim() || null,
          buyerFeedbackAt: new Date(),
        },
      });
      return;
    }

    const ticket = await this.db.ticketOrder.findUnique({
      where: { feedbackToken: token },
    });

    if (ticket) {
      if (!ticket.fulfilledAt) throw new Error("Event not marked complete yet");
      if (ticket.buyerFeedbackAt) throw new Error("Feedback already submitted");

      await this.db.ticketOrder.update({
        where: { id: ticket.id },
        data: {
          buyerRating: input.rating,
          buyerComment: input.comment?.trim() || null,
          buyerFeedbackAt: new Date(),
          buyerConfirmedAt: new Date(),
        },
      });

      payoutService.payoutTicketOrder(ticket.id).catch(console.error);
      return;
    }

    throw new Error("Invalid feedback link");
  }
}

export const feedbackService = new FeedbackService();
