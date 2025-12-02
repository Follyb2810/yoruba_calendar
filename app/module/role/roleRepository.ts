import { prisma } from "@/utils/prisma-client";

export const roleRepository = {
  async getAll() {
    return prisma.role.findMany();
  },

  async getByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  },

  async create(name: string) {
    return prisma.role.create({ data: { name } });
  },

  async assignToUser(userId: string, roleId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { roles: { connect: { id: roleId } } },
    });
  },

  async removeRoleFromUser(userId: string, roleName: string) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error("Role not found");

    return prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: { id: role.id },
        },
      },
    });
  },
};
