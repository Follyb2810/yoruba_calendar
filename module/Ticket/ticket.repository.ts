import { prisma } from "@/utils/prisma-client";

import { Ticket } from "@/generated/prisma";
import {
  TicketWithInclude,
  TTicketCreate,
  TTicketUpdate,
} from "./ticket.types";

export class TicketRepostory {
  private readonly db = prisma;
  async createTicket(data: TTicketCreate): Promise<Ticket> {
    return this.db.ticket.create({
      data,
    });
  }

  async getTicketById(id: number): Promise<TicketWithInclude | null> {
    return this.db.ticket.findUnique({
      where: { id },
      include: {
        creator: true,
        festival: true,
      },
    });
  }

  async getAllTickets(): Promise<TicketWithInclude[]> {
    return this.db.ticket.findMany({
      include: {
        creator: true,
        festival: true,
      },
    });
  }

  async updateTicket(
    id: number,
    data: TTicketUpdate
  ): Promise<TicketWithInclude> {
    return this.db.ticket.update({
      where: { id },
      data,
      include: {
        creator: true,
        festival: true,
      },
    });
  }

  async deleteTicket(id: number) {
    return this.db.ticket.delete({
      where: { id },
    });
  }
}
