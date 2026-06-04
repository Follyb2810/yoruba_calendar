import { Book, BookStatus } from "@/generated/prisma";

export type SerializedBook = {
  id: number;
  title: string;
  description: string;
  author: string;
  price: number;
  currency: string;
  coverImage: string | null;
  stock: number;
  status: string;
  inStock: boolean;
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
    stock: book.stock,
    status: book.status,
    inStock: book.stock > 0,
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
