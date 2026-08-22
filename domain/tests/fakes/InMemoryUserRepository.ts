import { User } from "../../src/entities/User";
import { IUserRepository } from "../../src/repositories/IUserRepository";
import { signupIpLookupValues } from "../../src/value-objects/SignupIp";

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  private nextId = 1;

  async findById(id: number): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email.toString() === email.toLowerCase()) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find((user) => user.username === username) ?? null;
  }

  async findBySignupIp(ip: string): Promise<User[]> {
    const aliases = signupIpLookupValues(ip);
    return this.users.filter((user) => user.signupIp !== null && aliases.includes(user.signupIp));
  }

  async findAll(): Promise<User[]> {
    return [...this.users].sort((a, b) => {
      const byDate = b.createdAt.getTime() - a.createdAt.getTime();
      if (byDate !== 0) return byDate;
      return a.username.localeCompare(b.username);
    });
  }

  async save(user: User): Promise<User> {
    if (user.id != null) {
      const index = this.users.findIndex((row) => row.id === user.id);
      if (index >= 0) {
        this.users[index] = user;
        return user;
      }
    }

    const rehydrated = User.rehydrate(
      this.nextId++,
      user.username,
      user.email.toString(),
      user.passwordHash,
      user.role,
      user.createdAt,
      user.birthDate,
      user.urlImg.toString(),
      user.signupIp,
    );
    this.users.push(rehydrated);
    return rehydrated;
  }

  async deleteById(id: number): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }
}
