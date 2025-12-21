import { FestivalRepostory } from "./festival.repository";
import {
  TFestivalCreate,
  TFestivalUpdate,
  FestivalWithInclude,
} from "./festival.types";
import { Festival } from "@/generated/prisma";

export class FestivalService {
  constructor(private readonly festivalRepository = new FestivalRepostory()) {}

  async createFestival(
    data: TFestivalCreate,
    userId: string
  ): Promise<Festival> {
    /**
     * Business rules you can extend later:
     * - validate date range
     * - validate user exists
     * - validate orisa exists
     */

    return this.festivalRepository.createFestival({
      ...data,
      userId, // enforce ownership at service layer
    });
  }

  // --------------------
  // READ
  // --------------------

  async getFestivalById(id: number): Promise<FestivalWithInclude> {
    const festival = await this.festivalRepository.getFestivalById(id);

    if (!festival) {
      throw new Error("Festival not found");
    }

    return festival;
  }

  async getAllFestivals(): Promise<FestivalWithInclude[]> {
    return this.festivalRepository.getAllFestivals();
  }

  // --------------------
  // UPDATE
  // --------------------

  async updateFestival(
    id: number,
    data: TFestivalUpdate,
    userId: string
  ): Promise<FestivalWithInclude> {
    const festival = await this.getFestivalById(id);

    // ownership check (VERY IMPORTANT)
    if (festival.userId !== userId) {
      throw new Error("You are not allowed to update this festival");
    }

    return this.festivalRepository.updateFestival(id, data);
  }

  // --------------------
  // DELETE
  // --------------------

  async deleteFestival(id: number, userId: string): Promise<void> {
    const festival = await this.getFestivalById(id);

    if (festival.userId !== userId) {
      throw new Error("You are not allowed to delete this festival");
    }

    await this.festivalRepository.deleteFestival(id);
  }
}
