import { Prisma, Ticket } from "@/generated/prisma";

export type TTicketID = Ticket["id"];
export type TTicketRead = Omit<Ticket, "createdAt" | "updatedAt">;

export type TTicketCreate = Omit<Ticket, "id" | "createdAt" | "updatedAt">;
export type TTicketUpdate = Partial<Omit<TTicketCreate, "id">>;

export type TicketWithInclude = Prisma.TicketGetPayload<{
  include: { festival: true; creator: true };
}>;
