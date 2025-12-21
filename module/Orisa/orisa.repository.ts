import { prisma } from "@/utils/prisma-client";

import { Orisa } from "@/generated/prisma";
import { OrisaWithInclude, TOrisaCreate, TOrisaUpdate } from "./orisa.types";

export class OrisaRepostory {
  private readonly db = prisma;
  async createOrisa(data: TOrisaCreate): Promise<Orisa> {
    const { name } = data;
    return this.db.orisa.create({
      data: { name },
    });
  }

  async getOrisaById(id: number): Promise<OrisaWithInclude | null> {
    return this.db.orisa.findUnique({
      where: { id },
      include: {
        festivals: true,
      },
    });
  }

  async getAllOrisas(): Promise<OrisaWithInclude[]> {
    return this.db.orisa.findMany({
      include: {
        festivals: true,
      },
    });
  }

  async updateOrisa(id: number, data: TOrisaUpdate): Promise<OrisaWithInclude> {
    return this.db.orisa.update({
      where: { id },
      data,
      include: {
        festivals: true,
      },
    });
  }

  async deleteOrisa(id: number) {
    return this.db.orisa.delete({
      where: { id },
    });
  }
}
