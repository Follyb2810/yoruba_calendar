import { Prisma, Orisa } from "@/generated/prisma";

export type TOrisaID = Orisa["id"];
export type TOrisaRead = Omit<Orisa, "createdAt" | "updatedAt">;

export type TOrisaCreate = Omit<Orisa, "id" | "createdAt" | "updatedAt">;
export type TOrisaUpdate = Partial<Omit<TOrisaCreate, "id">>;

export type OrisaWithInclude = Prisma.OrisaGetPayload<{
  include: { festivals: true };
}>;
