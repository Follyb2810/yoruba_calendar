import { Book, BookStatus, Prisma } from "@/generated/prisma";

export type SerializedBook = {
  id: number;
  title: string;
  description: string;
  author: string;
  price: number;
  currency: string;
  coverImage: string | null;
  backImage: string | null;
  stock: number;
  status: string;
  inStock: boolean;
  allowsDelivery: boolean;
  allowsPickup: boolean;
  pickupLocation: string | null;
  userId?: string;
  createdAt: string;
};

export function serializeBook(book: Book): SerializedBook {
  return {
    id: book.id,
    title: book.title,
    description: book.description,
    author: book.author,
    price: book.price,
    currency: book.currency,
    coverImage: book.coverImage,
    backImage: book.backImage,
    stock: book.stock,
    status: book.status,
    inStock: book.stock > 0,
    allowsDelivery: book.allowsDelivery,
    allowsPickup: book.allowsPickup,
    pickupLocation: book.pickupLocation,
    userId: book.userId,
    createdAt: book.createdAt.toISOString(),
  };
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function fulfillmentLabel(method: "DELIVERY" | "PICKUP"): string {
  return method === "DELIVERY" ? "Home delivery" : "Pick up in person";
}
