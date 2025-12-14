import { prisma } from "@/utils/prisma-client";

export const festivalRepository = {
  async getAll(limit?: number) {
    return prisma.festival.findMany({
      take: limit,
      include: { orisa: true, user: true },
    });
  },

  async getById(id: number) {
    return prisma.festival.findUnique({
      where: { id },
      include: { orisa: true, user: true },
    });
  },

  async create(data: any) {
    return prisma.festival.create({
      data,
      include: { orisa: true, user: true },
    });
  },

  async update(id: number, data: any) {
    return prisma.festival.update({
      where: { id },
      data,
      include: { orisa: true, user: true },
    });
  },

  async delete(id: number) {
    return prisma.festival.delete({ where: { id } });
  },
};
