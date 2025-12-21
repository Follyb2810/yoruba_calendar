import { OrisaRepostory } from "./orisa.repository";
import { OrisaWithInclude, TOrisaCreate, TOrisaUpdate } from "./orisa.types";
import { Orisa } from "@/generated/prisma";

export class OrisaService {
  constructor(private readonly orisaRepository = new OrisaRepostory()) {}

  async createOrisa(data: TOrisaCreate): Promise<Orisa> {
    const existing = await this.orisaRepository.getAllOrisas();

    if (
      existing.some((o) => o.name.toLowerCase() === data.name.toLowerCase())
    ) {
      throw new Error("Orisa already exists");
    }

    return this.orisaRepository.createOrisa(data);
  }

  async getOrisaById(id: number): Promise<OrisaWithInclude> {
    const orisa = await this.orisaRepository.getOrisaById(id);

    if (!orisa) {
      throw new Error("Orisa not found");
    }

    return orisa;
  }

  async getAllOrisas(): Promise<OrisaWithInclude[]> {
    return this.orisaRepository.getAllOrisas();
  }

  async updateOrisa(id: number, data: TOrisaUpdate): Promise<OrisaWithInclude> {
    await this.ensureOrisaExists(id);

    return this.orisaRepository.updateOrisa(id, data);
  }

  async deleteOrisa(id: number): Promise<void> {
    await this.ensureOrisaExists(id);

    await this.orisaRepository.deleteOrisa(id);
  }

  private async ensureOrisaExists(id: number) {
    const orisa = await this.orisaRepository.getOrisaById(id);

    if (!orisa) {
      throw new Error("Orisa not found");
    }
  }
}
