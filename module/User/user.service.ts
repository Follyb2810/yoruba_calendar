import { UserRepository } from "./user.repository";
import { TUserCreate, UserWithRoles } from "./user.types";
import bcrypt from "bcrypt";
export class UserService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async createUser(data: TUserCreate): Promise<UserWithRoles> {
    const { email, password } = data;
    const existingUser = await this.userRepository.getUserByEmail(email);

    if (existingUser) {
      throw new Error("User already exists");
    }
    const hashPwd = await bcrypt.hash(password!, 10);

    const newUser = this.userRepository.createUser({
      email,
      password: hashPwd,
    });
    await this.assignRole((await newUser).id, "USER");
    return newUser;
  }
  async loginUser(data: TUserCreate): Promise<UserWithRoles> {
    const { email, password } = data;
    const userExist = await this.userRepository.getUserByEmail(email);
    if (!userExist) {
      throw new Error("User doesnt exist");
    }
    const valid = await bcrypt.compare(String(password), userExist.password!);
    if (!valid) {
      throw new Error("Invalid Credential");
    }
    return userExist;
  }

  async getUserById(id: string): Promise<UserWithRoles> {
    const user = await this.userRepository.getUserById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<UserWithRoles> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async getAllUsers(): Promise<UserWithRoles[]> {
    return this.userRepository.getAllUsers();
  }

  async updateUser(
    id: string,
    data: Partial<{ name: string; image: string; password: string }>
  ): Promise<UserWithRoles> {
    await this.ensureUserExists(id);
    return this.userRepository.updateUser(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    await this.ensureUserExists(id);
    await this.userRepository.deleteUser(id);
  }

  async assignRole(userId: string, roleName: string) {
    await this.ensureUserExists(userId);
    return this.userRepository.assignRole(userId, roleName);
  }

  async removeRole(userId: string, roleName: string) {
    await this.ensureUserExists(userId);
    return this.userRepository.removeRole(userId, roleName);
  }

  async getUserRoles(userId: string) {
    await this.ensureUserExists(userId);
    return this.userRepository.getUserRoles(userId);
  }

  private async ensureUserExists(userId: string) {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
  }
}
