import { festivalRepository } from "./festivalRepository";

export const festivalService = {
  async listFestivals(limit?: number) {
    return festivalRepository.getAll(limit);
  },

  async getFestival(id: number) {
    const festival = await festivalRepository.getById(id);
    if (!festival) throw new Error("Festival not found");
    return festival;
  },

  async createFestival(userId: string, data: any) {
    if (!data.orisaId) throw new Error("Orisa is required");
    return festivalRepository.create({ ...data, userId });
  },

  async updateFestival(id: number, data: any) {
    return festivalRepository.update(id, data);
  },

  async deleteFestival(id: number) {
    return festivalRepository.delete(id);
  },
};
