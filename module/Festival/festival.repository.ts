import { prisma } from "@/utils/prisma-client";
import {
  FestivalWithInclude,
  TFestivalCreate,
  TFestivalUpdate,
} from "./festival.types";
import { Festival, FestivalStatus, Prisma } from "@/generated/prisma";

export type TicketInput = {
  name: string;
  type: string;
  isFree: boolean;
  price?: number;
  quantity: number;
  maxPerGroup?: number;
};

export class FestivalRepository {
  private readonly db = prisma;

  async createFestival(data: TFestivalCreate): Promise<Festival> {
    return this.db.festival.create({ data });
  }

  async createFestivalWithTickets(
    data: TFestivalCreate,
    tickets: TicketInput[],
    userId: string
  ): Promise<FestivalWithInclude> {
    return this.db.$transaction(async (tx) => {
      const festival = await tx.festival.create({ data });

      if (tickets.length > 0) {
        await tx.ticket.createMany({
          data: tickets.map((t) => ({
            festivalId: festival.id,
            creatorId: userId,
            name: t.name,
            type: t.type,
            isFree: t.isFree,
            price: t.isFree ? null : (t.price ?? 0),
            quantity: t.quantity,
            maxPerGroup: t.maxPerGroup ?? null,
          })),
        });
      }

      return tx.festival.findUniqueOrThrow({
        where: { id: festival.id },
        include: { orisa: true, tickets: true, user: true },
      });
    });
  }

  async getFestivalById(id: number): Promise<FestivalWithInclude | null> {
    return this.db.festival.findUnique({
      where: { id },
      include: { orisa: true, tickets: true, user: true },
    });
  }

  async getAllFestivals(
    where?: Prisma.FestivalWhereInput
  ): Promise<FestivalWithInclude[]> {
    return this.db.festival.findMany({
      where,
      include: { orisa: true, tickets: true, user: true },
      orderBy: { startDate: "asc" },
    });
  }

  async updateFestival(
    id: number,
    data: TFestivalUpdate
  ): Promise<FestivalWithInclude> {
    return this.db.festival.update({
      where: { id },
      data,
      include: { orisa: true, tickets: true, user: true },
    });
  }

  async deleteFestival(id: number) {
    return this.db.festival.delete({ where: { id } });
  }
}

// Keep old export name for any lingering imports
export { FestivalRepository as FestivalRepostory };
