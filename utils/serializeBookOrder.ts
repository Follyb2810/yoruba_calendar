import type { BookOrder, Book, User, OrderStatus, FulfillmentMethod } from "@/generated/prisma";
import { formatNaira, fulfillmentLabel } from "@/utils/serializeBook";

export type SerializedBookOrder = {
  id: number;
  status: OrderStatus;
  amount: number;
  amountNaira: number;
  paystackReference: string | null;
  fulfillmentMethod: FulfillmentMethod;
  fulfillmentLabel: string;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryPhone: string | null;
  pickupLocation: string | null;
  isNew: boolean;
  isFulfilled: boolean;
  fulfilledAt: string | null;
  buyerConfirmedAt: string | null;
  paymentToken: string | null;
  payoutStatus: string;
  creatorPayoutAmount: number | null;
  buyerRating: number | null;
  buyerFeedbackAt: string | null;
  createdAt: string;
  book: {
    id: number;
    title: string;
    author: string;
    coverImage: string | null;
  };
  buyer: {
    id: string;
    name: string | null;
    email: string;
  };
};

type OrderWithRelations = BookOrder & {
  book: Pick<Book, "id" | "title" | "author" | "coverImage" | "userId">;
  user: Pick<User, "id" | "name" | "email">;
};

export function serializeBookOrder(order: OrderWithRelations): SerializedBookOrder {
  return {
    id: order.id,
    status: order.status,
    amount: order.amount,
    amountNaira: order.amount / 100,
    paystackReference: order.paystackReference,
    fulfillmentMethod: order.fulfillmentMethod,
    fulfillmentLabel: fulfillmentLabel(order.fulfillmentMethod),
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    deliveryPhone: order.deliveryPhone,
    pickupLocation: order.pickupLocation,
    isNew: order.status === "ORDERED" || order.status === "AWAITING_PAYMENT"
      ? !order.sellerAcknowledgedAt
      : order.status === "SUCCESS" && !order.sellerAcknowledgedAt,
    isFulfilled: !!order.fulfilledAt,
    fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
    buyerConfirmedAt: order.buyerConfirmedAt?.toISOString() ?? null,
    paymentToken: order.paymentToken,
    payoutStatus: order.payoutStatus,
    creatorPayoutAmount:
      order.creatorPayoutAmount != null ? order.creatorPayoutAmount / 100 : null,
    buyerRating: order.buyerRating,
    buyerFeedbackAt: order.buyerFeedbackAt?.toISOString() ?? null,
    createdAt: order.createdAt.toISOString(),
    book: {
      id: order.book.id,
      title: order.book.title,
      author: order.book.author,
      coverImage: order.book.coverImage,
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
    case "ORDERED":
      return "Order placed";
    case "AWAITING_PAYMENT":
      return "Ready — awaiting payment";
    case "SUCCESS":
      return "Paid";
    case "PENDING":
      return "Payment processing";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
}

export { formatNaira };
