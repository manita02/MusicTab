import { describe, it, expect, beforeEach } from "vitest";
import { CreateTab } from "../src/use-cases/CreateTab";
import { Role, User } from "../src/entities/User";
import { IUserRepository } from "../src/repositories/IUserRepository";
import { DomainError } from "../src/errors/DomainError";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";

class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: number) {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async save(user: User) {
    const newId = user.id ?? this.users.length + 1;
    const rehydrated = User.rehydrate(
      newId,
      user.username,
      user.email.toString(),
      user.passwordHash,
      user.role,
      user.createdAt,
      user.birthDate,
      user.urlImg.toString(),
    );
    const idx = this.users.findIndex((u) => u.id === newId);
    if (idx >= 0) this.users[idx] = rehydrated;
    else this.users.push(rehydrated);
    return rehydrated;
  }

  async deleteById(id: number) {
    this.users = this.users.filter((u) => u.id !== id);
  }

  async findByEmail(email: string) {
    return this.users.find((u) => u.email.toString() === email.toLowerCase()) ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.users.find((u) => u.username === username) ?? null;
  }
}

const birth = () => new Date("1995-06-01");
const img = () => "https://example.com/avatar.png";

describe("CreateTab use case", () => {
  let tabRepo: InMemoryTabRepository;
  let userRepo: InMemoryUserRepository;
  let useCase: CreateTab;

  beforeEach(async () => {
    tabRepo = new InMemoryTabRepository();
    userRepo = new InMemoryUserRepository();
    useCase = new CreateTab(tabRepo, userRepo);
    await userRepo.save(User.create("user", "user@u.com", "hash", Role.USER, birth(), img()));
    await userRepo.save(User.create("admin", "admin@a.com", "hash", Role.ADMIN, birth(), img()));
  });

  const payload = {
    title: "Song 1",
    artist: "Test Artist",
    genreId: 1,
    instrumentId: 1,
    urlPdf: "http://example.com/tab.pdf",
    urlYoutube: "http://youtube.com/video",
    urlImg: "http://example.com/img.jpg",
  };

  it("rejects creation for normal users", async () => {
    const user = (await userRepo.findByEmail("user@u.com"))!;
    await expect(
      useCase.execute({
        ...payload,
        userId: user.id!,
      }),
    ).rejects.toThrow(DomainError);
  });

  it("allows admin to create tabs", async () => {
    const admin = (await userRepo.findByEmail("admin@a.com"))!;
    const tab = await useCase.execute({
      ...payload,
      userId: admin.id!,
    });
    expect(tab.id).toBeDefined();
    expect(tab.title).toBe(payload.title);
    expect(tab.artist).toBe("Test Artist");
  });

  it("rejects empty artist on new tabs", async () => {
    const admin = (await userRepo.findByEmail("admin@a.com"))!;
    await expect(
      useCase.execute({
        ...payload,
        artist: "   ",
        userId: admin.id!,
      }),
    ).rejects.toThrow(DomainError);
  });

  it("throws if user does not exist", async () => {
    await expect(
      useCase.execute({
        ...payload,
        userId: 999,
      }),
    ).rejects.toThrow(DomainError);
  });
});
