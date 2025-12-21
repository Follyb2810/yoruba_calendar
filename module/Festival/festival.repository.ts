import { prisma } from "@/utils/prisma-client";
import {
  FestivalWithInclude,
  TFestivalCreate,
  TFestivalUpdate,
} from "./festival.types";
import { Festival } from "@/generated/prisma";

export class FestivalRepostory {
  private readonly db = prisma;
  async createFestival(data: TFestivalCreate): Promise<Festival> {
    return this.db.festival.create({
      data: data,
    });
  }

  async getFestivalById(id: number): Promise<FestivalWithInclude | null> {
    return this.db.festival.findUnique({
      where: { id },
      include: {
        orisa: true,
        tickets: true,
        user: true,
      },
    });
  }

  async getAllFestivals(): Promise<FestivalWithInclude[]> {
    return this.db.festival.findMany({
      include: {
        orisa: true,
        tickets: true,
        user: true,
      },
    });
  }

  async updateFestival(
    id: number,
    data: TFestivalUpdate
  ): Promise<FestivalWithInclude> {
    return this.db.festival.update({
      where: { id },
      data,
      include: {
        orisa: true,
        tickets: true,
        user: true,
      },
    });
  }

  async deleteFestival(id: number) {
    return this.db.festival.delete({
      where: { id },
    });
  }
}
