import { describe, it, expect, beforeEach } from "vitest";
import { CreateGenre } from "../src/use-cases/CreateGenre";
import { Role, User } from "../src/entities/User";
import { ConflictError, DomainError } from "../src/errors/DomainError";
import { InMemoryGenreRepository } from "./fakes/InMemoryGenreRepository";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";

const birth = () => new Date("1995-06-01");
const img = () => "https://example.com/avatar.png";

describe("CreateGenre use case", () => {
  let genreRepo: InMemoryGenreRepository;
  let userRepo: InMemoryUserRepository;
  let useCase: CreateGenre;
  let adminId: number;
  let userId: number;

  beforeEach(async () => {
    genreRepo = new InMemoryGenreRepository();
    userRepo = new InMemoryUserRepository();
    useCase = new CreateGenre(genreRepo, userRepo);
    const user = await userRepo.save(User.create("user", "user@gmail.com", "hash", Role.USER, birth(), img()));
    const admin = await userRepo.save(User.create("admin", "admin@gmail.com", "hash", Role.ADMIN, birth(), img()));
    userId = user.id!;
    adminId = admin.id!;
  });

  it("rejects creation for normal users", async () => {
    await expect(useCase.execute({ userId, name: "Cumbia" })).rejects.toMatchObject({ code: "AuthError" });
  });

  it("throws if user does not exist", async () => {
    await expect(useCase.execute({ userId: 999, name: "Cumbia" })).rejects.toThrow(DomainError);
  });

  it("rejects an empty name", async () => {
    await expect(useCase.execute({ userId: adminId, name: "   " })).rejects.toThrow(DomainError);
  });

  it("allows admin to create a genre", async () => {
    const genre = await useCase.execute({ userId: adminId, name: "  Cumbia  " });
    expect(genre.id).toBeGreaterThan(0);
    expect(genre.name).toBe("Cumbia");
  });

  it("rejects a duplicate name case-insensitively", async () => {
    await useCase.execute({ userId: adminId, name: "Cumbia" });
    await expect(useCase.execute({ userId: adminId, name: "cumbia" })).rejects.toBeInstanceOf(ConflictError);
  });
});
