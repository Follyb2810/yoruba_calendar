import { Prisma, User } from "@/generated/prisma";

export type TUserID = User["id"];
export type TUserRead = Omit<User, "createdAt" | "updatedAt" | "password">;

export type TUserCreate = Omit<
  User,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "roles"
  | "isActive"
  | "twoFactorEnabled"
  | "image"
  | "emailVerified"
  | "name"
>;
export type TUserUpdate = Partial<Omit<TUserCreate, "id">>;

export type UserWithRoles = Prisma.UserGetPayload<{
  include: { roles: { include: { role: true } } };
}>;
