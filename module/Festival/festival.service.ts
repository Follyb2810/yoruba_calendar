import { FestivalRepository } from "./festival.repository";
import {
  TFestivalCreate,
  TFestivalUpdate,
  FestivalWithInclude,
} from "./festival.types";
import { Festival, FestivalStatus, Prisma } from "@/generated/prisma";
import { combineDateAndTime, isFestivalEnded } from "@/utils/formatDate";
import type { CreateFestivalInput } from "@/helpers/zod/festival-api.schema";
import type { TicketInput } from "./festival.repository";

export class FestivalService {
  constructor(
    private readonly festivalRepository = new FestivalRepository()
  ) {}

  buildFestivalData(input: CreateFestivalInput, userId: string): TFestivalCreate {
    const startDate = combineDateAndTime(input.startDate, input.startTime);
    const endDate = combineDateAndTime(input.endDate, input.endTime);

    if (endDate < startDate) {
      throw new Error("End date cannot be before start date");
    }

    return {
      title: input.title,
      description: input.description,
      orisaId: input.orisaId,
      userId,
      country: input.country,
      eventType: input.eventType,
      location: input.eventType === "physical" ? (input.location ?? null) : null,
      eventLink: input.eventType === "virtual" ? (input.eventLink ?? null) : null,
      timezone: input.timezone,
      startDate,
      endDate,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
      ticketType: input.ticketType,
      status: (input.status ?? "DRAFT") as FestivalStatus,
      image: null,
      banner: null,
    };
  }

  async createFestival(
    input: CreateFestivalInput,
    userId: string
  ): Promise<FestivalWithInclude> {
    const data = this.buildFestivalData(input, userId);
    const tickets: TicketInput[] = (input.tickets ?? []).map((t) => ({
      name: t.name,
      type: t.type,
      isFree: t.isFree,
      price: t.price,
      quantity: t.quantity,
      maxPerGroup: t.maxPerGroup,
    }));

    return this.festivalRepository.createFestivalWithTickets(
      data,
      tickets,
      userId
    );
  }

  async getFestivalById(id: number): Promise<FestivalWithInclude> {
    const festival = await this.festivalRepository.getFestivalById(id);
    if (!festival) throw new Error("Festival not found");
    return festival;
  }

  async getPublicFestivals(search = ""): Promise<FestivalWithInclude[]> {
    return this.festivalRepository.getAllFestivals({
      status: FestivalStatus.PUBLISHED,
      ...(search
        ? {
            title: {
              contains: search,
            },
          }
        : {}),
    });
  }

  async getUserFestivals(
    userId: string,
    filter?: "all" | "published" | "drafts" | "ended"
  ): Promise<FestivalWithInclude[]> {
    const festivals = await this.festivalRepository.getAllFestivals({
      userId,
    });

    switch (filter) {
      case "published":
        return festivals.filter(
          (f) => f.status === FestivalStatus.PUBLISHED && !isFestivalEnded(f.endDate)
        );
      case "drafts":
        return festivals.filter((f) => f.status === FestivalStatus.DRAFT);
      case "ended":
        return festivals.filter((f) => isFestivalEnded(f.endDate));
      default:
        return festivals;
    }
  }

  async updateFestival(
    id: number,
    data: TFestivalUpdate,
    userId: string
  ): Promise<FestivalWithInclude> {
    const festival = await this.getFestivalById(id);
    if (festival.userId !== userId) {
      throw new Error("You are not allowed to update this festival");
    }
    return this.festivalRepository.updateFestival(id, data);
  }

  async publishFestival(id: number, userId: string): Promise<FestivalWithInclude> {
    return this.updateFestival(id, { status: FestivalStatus.PUBLISHED }, userId);
  }

  async deleteFestival(id: number, userId: string): Promise<void> {
    const festival = await this.getFestivalById(id);
    if (festival.userId !== userId) {
      throw new Error("You are not allowed to delete this festival");
    }
    await this.festivalRepository.deleteFestival(id);
  }
}

export const festivalService = new FestivalService();
