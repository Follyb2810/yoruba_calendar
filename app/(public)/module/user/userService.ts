import { userRepository } from "./userRepository";
import { roleRepository } from "./../role/roleRepository";

export const userService = {
  async getUser(id: string) {
    const user = await userRepository.getById(id);
    if (!user) throw new Error("User not found");
    return user;
  },

  async createUser(data: any) {
    return userRepository.create(data);
  },

  async assignRole(userId: string, roleName: string) {
    const role = await roleRepository.getByName(roleName);
    if (!role) throw new Error("Role not found");
    return roleRepository.assignToUser(userId, role.id);
  },
};
