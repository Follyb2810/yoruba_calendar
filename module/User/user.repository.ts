import { prisma } from "@/utils/prisma-client";
import { TUserCreate, UserWithRoles } from "./user.types";

export class UserRepository {
  private readonly db = prisma;
  async createUser({ email, password }: TUserCreate): Promise<UserWithRoles> {
    return this.db.user.create({
      data: {
        email,
        password,
        roles: {
          create: [
            {
              role: {
                connectOrCreate: {
                  where: { name: "USER" },
                  create: { name: "USER" },
                },
              },
            },
          ],
        },
      },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async getUserByEmail(email: string): Promise<UserWithRoles | null> {
    return this.db.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async getUserById(id: string): Promise<UserWithRoles | null> {
    return this.db.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async getAllUsers(): Promise<UserWithRoles[]> {
    return this.db.user.findMany({
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async updateUser(
    id: string,
    data: Partial<{ name: string; image: string; password: string }>
  ): Promise<UserWithRoles> {
    return this.db.user.update({
      where: { id },
      data,
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  async deleteUser(id: string) {
    return this.db.user.delete({
      where: { id },
    });
  }

  async assignRole(userId: string, roleName: string) {
    return this.db.$transaction(async (tx) => {
      let role = await tx.role.findUnique({
        where: { name: roleName },
      });

      if (!role) {
        role = await tx.role.create({
          data: { name: roleName },
        });
      }

      return tx.userRole.create({
        data: {
          userId,
          roleId: role.id,
        },
      });
    });
  }

  async removeRole(userId: string, roleName: string) {
    const role = await this.db.role.findUnique({
      where: { name: roleName },
    });

    if (!role) return;

    await this.db.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });
  }

  async getUserRoles(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) return [];
    return user.roles.map((ur) => ur.role);
  }
}
