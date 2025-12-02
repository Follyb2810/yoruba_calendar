import { userRepository } from "./../user/userRepository";
import { roleRepository } from "./roleRepository";

export const roleService = {
  // List all roles
  async listRoles() {
    return roleRepository.getAll();
  },

  // Create a new role
  async createRole(name: string) {
    return roleRepository.create(name);
  },

  // Assign a role to a user
  async addRoleToUser(userId: string, roleName: string) {
    const role = await roleRepository.getByName(roleName);
    if (!role) throw new Error("Role not found");

    return roleRepository.assignToUser(userId, role.id);
  },

  // Remove a role from a user
  async removeRoleFromUser(userId: string, roleName: string) {
    const role = await roleRepository.getByName(roleName);
    if (!role) throw new Error("Role not found");

    return roleRepository.removeRoleFromUser(userId, role.id);
  },

  // Check if user has a specific role
  async userHasRole(userId: string, roleName: string) {
    const user = await userRepository.getById(userId);
    if (!user) throw new Error("User not found");

    return user.roles.some((r: any) => r.name === roleName);
  },
};
