import { prisma } from "@/utils/prisma-client";

export const orisaRepository = {
  async getAll() {
    return prisma.orisa.findMany({ include: { festivals: true } });
  },

  async getById(id: number) {
    return prisma.orisa.findUnique({
      where: { id },
      include: { festivals: true },
    });
  },

  async create(name: string) {
    return prisma.orisa.create({ data: { name } });
  },

  async update(id: number, name: string) {
    return prisma.orisa.update({ where: { id }, data: { name } });
  },

  async delete(id: number) {
    return prisma.orisa.delete({ where: { id } });
  },
};
