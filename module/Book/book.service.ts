import { prisma } from "@/utils/prisma-client";
import { BookStatus, Prisma } from "@/generated/prisma";
import type { CreateBookInput, UpdateBookInput } from "@/helpers/zod/book.schema";
import { canManageResource } from "@/utils/rbac";
import { serializeBook, type SerializedBook } from "@/utils/serializeBook";

export class BookService {
  private db = prisma;

  assertCanManage(
    ownerId: string,
    user: { id: string; roles: string[] }
  ) {
    if (!canManageResource(user, ownerId)) {
      throw new Error("You are not allowed to manage this book");
    }
  }

  async createBook(input: CreateBookInput, userId: string) {
    const book = await this.db.book.create({
      data: {
        title: input.title,
        description: input.description,
        author: input.author,
        price: input.price,
        currency: input.currency ?? "NGN",
        coverImage: input.coverImage || null,
        backImage: input.backImage || null,
        stock: input.stock ?? 0,
        status: (input.status ?? "DRAFT") as BookStatus,
        allowsDelivery: input.allowsDelivery ?? true,
        allowsPickup: input.allowsPickup ?? true,
        pickupLocation: input.pickupLocation?.trim() || null,
        userId,
      },
    });
    return serializeBook(book);
  }

  async getBookById(id: number) {
    const book = await this.db.book.findUnique({ where: { id } });
    if (!book) throw new Error("Book not found");
    return book;
  }

  async getPublicBooks(search = "") {
    const books = await this.db.book.findMany({
      where: {
        status: BookStatus.PUBLISHED,
        ...(search ? { title: { contains: search } } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return books.map(serializeBook);
  }

  async getUserBooks(userId: string) {
    const books = await this.db.book.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return books.map(serializeBook);
  }

  async getAllBooks(search = "") {
    const books = await this.db.book.findMany({
      where: search ? { title: { contains: search } } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return books.map(serializeBook);
  }

  async updateBook(
    id: number,
    input: UpdateBookInput,
    user: { id: string; roles: string[] }
  ): Promise<SerializedBook> {
    const book = await this.getBookById(id);
    this.assertCanManage(book.userId, user);

    const updated = await this.db.book.update({
      where: { id },
      data: {
        ...input,
        ...(input.coverImage !== undefined
          ? { coverImage: input.coverImage || null }
          : {}),
        ...(input.backImage !== undefined
          ? { backImage: input.backImage || null }
          : {}),
      },
    });
    return serializeBook(updated);
  }

  async setBookStatus(
    id: number,
    status: BookStatus,
    user: { id: string; roles: string[] }
  ) {
    const book = await this.getBookById(id);
    this.assertCanManage(book.userId, user);
    const updated = await this.db.book.update({
      where: { id },
      data: { status },
    });
    return serializeBook(updated);
  }

  async deleteBook(id: number, user: { id: string; roles: string[] }) {
    const book = await this.getBookById(id);
    this.assertCanManage(book.userId, user);
    await this.db.book.delete({ where: { id } });
  }
}

export const bookService = new BookService();
