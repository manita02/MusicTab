import { describe, it, expect, beforeEach } from "vitest";
import { CreateTab } from "../src/use-cases/CreateTab";
import { Role, User } from "../src/entities/User";
import { DomainError } from "../src/errors/DomainError";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";

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
    await userRepo.save(User.create("user", "user@gmail.com", "hash", Role.USER, birth(), img()));
    await userRepo.save(User.create("admin", "admin@gmail.com", "hash", Role.ADMIN, birth(), img()));
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
    const user = (await userRepo.findByEmail("user@gmail.com"))!;
    await expect(
      useCase.execute({
        ...payload,
        userId: user.id!,
      }),
    ).rejects.toThrow(DomainError);
  });

  it("allows admin to create tabs", async () => {
    const admin = (await userRepo.findByEmail("admin@gmail.com"))!;
    const tab = await useCase.execute({
      ...payload,
      userId: admin.id!,
    });
    expect(tab.id).toBeDefined();
    expect(tab.title).toBe(payload.title);
    expect(tab.artist).toBe("Test Artist");
  });

  it("rejects empty artist on new tabs", async () => {
    const admin = (await userRepo.findByEmail("admin@gmail.com"))!;
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
