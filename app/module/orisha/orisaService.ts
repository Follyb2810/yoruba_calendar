import { orisaRepository } from "./orisaRepository";

export const orisaService = {
  async listOrisas() {
    return orisaRepository.getAll();
  },

  async createOrisa(name: string) {
    return orisaRepository.create(name);
  },
};
