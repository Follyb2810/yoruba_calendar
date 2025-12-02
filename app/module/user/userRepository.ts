import { prisma } from "@/utils/prisma-client";

export const userRepository = {
  async getAll() {
    return prisma.user.findMany({ include: { roles: true, festivals: true } });
  },

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: true, festivals: true },
    });
  },

  async getByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { roles: true, festivals: true },
    });
  },

  async create(data: any) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.user.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
