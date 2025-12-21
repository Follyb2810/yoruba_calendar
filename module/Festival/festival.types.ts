import { Prisma, Festival } from "@/generated/prisma";

export type TFestivalID = Festival["id"];
export type TFestivalRead = Omit<
  Festival,
  "createdAt" | "updatedAt" | "password"
>;

export type TFestivalCreate = Omit<Festival, "id" | "createdAt" | "updatedAt">;
export type TFestivalUpdate = Partial<Omit<TFestivalCreate, "id">>;

export type FestivalWithInclude = Prisma.FestivalGetPayload<{
  include: { orisa: true; tickets: true; user: true };
}>;
