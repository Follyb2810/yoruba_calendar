import type { TicketOrder, Ticket, Festival, User, OrderStatus } from "@/generated/prisma";
import { formatNaira } from "@/utils/serializeBook";

export type SerializedTicketOrder = {
  id: number;
  status: OrderStatus;
  quantity: number;
  amount: number;
  amountNaira: number;
  paystackReference: string;
  buyerPhone: string | null;
  isNew: boolean;
  isFulfilled: boolean;
  fulfilledAt: string | null;
  payoutStatus: string;
  creatorPayoutAmount: number | null;
  buyerRating: number | null;
  buyerFeedbackAt: string | null;
  createdAt: string;
  ticket: {
    id: number;
    name: string;
    type: string;
    isFree: boolean;
  };
  festival: {
    id: number;
    title: string;
    startDate: string;
    location: string | null;
    country: string;
  };
  buyer: {
    id: string;
    name: string | null;
    email: string;
  };
};

type OrderWithRelations = TicketOrder & {
  ticket: Pick<Ticket, "id" | "name" | "type" | "isFree">;
  festival: Pick<Festival, "id" | "title" | "startDate" | "location" | "country" | "userId">;
  user: Pick<User, "id" | "name" | "email">;
};

export function serializeTicketOrder(order: OrderWithRelations): SerializedTicketOrder {
  return {
    id: order.id,
    status: order.status,
    quantity: order.quantity,
    amount: order.amount,
    amountNaira: order.amount / 100,
    paystackReference: order.paystackReference,
    buyerPhone: order.buyerPhone,
    isNew: order.status === "SUCCESS" && !order.sellerAcknowledgedAt,
    isFulfilled: !!order.fulfilledAt,
    fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
    payoutStatus: order.payoutStatus,
    creatorPayoutAmount:
      order.creatorPayoutAmount != null ? order.creatorPayoutAmount / 100 : null,
    buyerRating: order.buyerRating,
    buyerFeedbackAt: order.buyerFeedbackAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    ticket: {
      id: order.ticket.id,
      name: order.ticket.name,
      type: order.ticket.type,
      isFree: order.ticket.isFree,
    },
    festival: {
      id: order.festival.id,
      title: order.festival.title,
      startDate: order.festival.startDate.toISOString(),
      location: order.festival.location,
      country: order.festival.country,
    },
    buyer: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
    },
  };
}

export function formatOrderStatus(status: OrderStatus): string {
  switch (status) {
    case "SUCCESS":
      return "Paid";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

export { formatNaira };
