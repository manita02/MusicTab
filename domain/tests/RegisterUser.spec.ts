import { describe, it, expect, beforeEach } from "vitest";
import { RegisterUser } from "../src/use-cases/RegisterUser";
import { IUserRepository } from "../src/repositories/IUserRepository";
import { IPasswordHasher } from "../src/services/IPasswordHasher";
import { User, Role } from "../src/entities/User";
import { ConflictError } from "../src/errors/DomainError";

/** In-memory implementation for tests */
class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: number) {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string) {
    return this.users.find((u) => u.email.toString() === email.toLowerCase()) ?? null;
  }

  async save(user: User) {
    // simulate DB autoincrement id and return rehydrated user
    const newId = this.users.length + 1;
    const rehydrated = User.rehydrate(
      newId,
      user.username,
      user.email.toString(),
      user.passwordHash,
      // @ts-ignore access role property (it's public readonly)
      (user as any).role ?? Role.USER,
      (user as any).createdAt ?? new Date()
    );
    this.users.push(rehydrated);
    return rehydrated;
  }

  async deleteById(id: number) {
    this.users = this.users.filter((u) => u.id !== id);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find(u => u.username === username) ?? null;
  }  
}

/** Fake hasher for tests */
class FakeHasher implements IPasswordHasher {
  async hash(password: string) {
    return "hashed-" + password;
  }
  async compare(password: string, hash: string) {
    return hash === "hashed-" + password;
  }
}

describe("RegisterUser use case (domain TDD)", () => {
  let repo: InMemoryUserRepository;
  let hasher: FakeHasher;
  let useCase: RegisterUser;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    hasher = new FakeHasher();
    useCase = new RegisterUser(repo, hasher);
  });

  it("registers a new user", async () => {
    const user = await useCase.execute({ username: "pepe", email: "pepe@gmail.com", password: "secret" });

    expect(user.id).toBe(1);
    expect(user.email.toString()).toBe("pepe@gmail.com");
    expect(user.passwordHash).toBe("hashed-secret");
    expect(user.isAdmin()).toBe(false);
  });

  it("throws when email already exists", async () => {
    await useCase.execute({ username: "pepe", email: "pepe@gmail.com", password: "secret" });

    await expect(
      useCase.execute({ username: "pepe2", email: "pepe@gmail.com", password: "other" })
    ).rejects.toThrow(ConflictError);
  });
});
