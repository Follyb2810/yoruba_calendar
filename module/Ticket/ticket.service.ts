import { TicketRepostory } from "./ticket.repository";
import {
  TicketWithInclude,
  TTicketCreate,
  TTicketUpdate,
} from "./ticket.types";
import { Ticket } from "@/generated/prisma";

export class TicketService {
  constructor(private readonly ticketRepository = new TicketRepostory()) {}

  async createTicket(data: TTicketCreate): Promise<Ticket> {
    this.validateCreateTicket(data);
    return this.ticketRepository.createTicket(data);
  }

  async getTicketById(id: number): Promise<TicketWithInclude> {
    const ticket = await this.ticketRepository.getTicketById(id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return ticket;
  }

  async getAllTickets(): Promise<TicketWithInclude[]> {
    return this.ticketRepository.getAllTickets();
  }

  async updateTicket(
    id: number,
    data: TTicketUpdate
  ): Promise<TicketWithInclude> {
    await this.ensureTicketExists(id);
    this.validateUpdateTicket(data);

    return this.ticketRepository.updateTicket(id, data);
  }

  async deleteTicket(id: number): Promise<void> {
    await this.ensureTicketExists(id);
    await this.ticketRepository.deleteTicket(id);
  }

  async reduceQuantity(ticketId: number, amount = 1) {
    const ticket = await this.getTicketById(ticketId);

    if (!ticket.quantity || ticket.quantity < amount) {
      throw new Error("Not enough tickets available");
    }

    return this.ticketRepository.updateTicket(ticketId, {
      quantity: ticket.quantity - amount,
    });
  }

  validatePurchase(ticket: TicketWithInclude, quantityRequested: number) {
    if (!ticket.quantity || ticket.quantity < quantityRequested) {
      throw new Error("Insufficient ticket quantity");
    }

    if (
      ticket.type === "group" &&
      ticket.maxPerGroup &&
      quantityRequested > ticket.maxPerGroup
    ) {
      throw new Error(
        `You can only purchase up to ${ticket.maxPerGroup} tickets`
      );
    }
  }


  private validateCreateTicket(data: TTicketCreate) {
    if (!data.isFree && (data.price === undefined || data.price! < 0)) {
      throw new Error("Paid tickets must have a valid price");
    }

    if (data.quantity !== undefined && data.quantity < 1) {
      throw new Error("Ticket quantity must be at least 1");
    }

    if (data.type === "group" && (!data.maxPerGroup || data.maxPerGroup < 1)) {
      throw new Error("Group tickets must define maxPerGroup");
    }
  }

  private validateUpdateTicket(data: TTicketUpdate) {
    if (data.price !== undefined && data.price! < 0) {
      throw new Error("Price cannot be negative");
    }

    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    if (data.maxPerGroup !== undefined && data.maxPerGroup! < 1) {
      throw new Error("maxPerGroup must be at least 1");
    }
  }

  private async ensureTicketExists(id: number) {
    const ticket = await this.ticketRepository.getTicketById(id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }
  }
}
