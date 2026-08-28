import { describe, it, expect, beforeEach } from "vitest";
import { CreateGenre } from "../src/use-cases/CreateGenre";
import { UpdateGenre } from "../src/use-cases/UpdateGenre";
import { Role, User } from "../src/entities/User";
import { ConflictError, NotFoundError } from "../src/errors/DomainError";
import { InMemoryGenreRepository } from "./fakes/InMemoryGenreRepository";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";

const birth = () => new Date("1995-06-01");
const img = () => "https://example.com/avatar.png";

describe("UpdateGenre use case", () => {
  let genreRepo: InMemoryGenreRepository;
  let userRepo: InMemoryUserRepository;
  let createGenre: CreateGenre;
  let useCase: UpdateGenre;
  let adminId: number;
  let userId: number;

  beforeEach(async () => {
    genreRepo = new InMemoryGenreRepository();
    userRepo = new InMemoryUserRepository();
    createGenre = new CreateGenre(genreRepo, userRepo);
    useCase = new UpdateGenre(genreRepo, userRepo);
    const user = await userRepo.save(User.create("user", "user@gmail.com", "hash", Role.USER, birth(), img()));
    const admin = await userRepo.save(User.create("admin", "admin@gmail.com", "hash", Role.ADMIN, birth(), img()));
    userId = user.id!;
    adminId = admin.id!;
  });

  it("rejects updates for normal users", async () => {
    const genre = await createGenre.execute({ userId: adminId, name: "Rock" });
    await expect(useCase.execute({ userId, id: genre.id, name: "Jazz" })).rejects.toMatchObject({
      code: "AuthError",
    });
  });

  it("rejects a missing genre", async () => {
    await expect(useCase.execute({ userId: adminId, id: 999, name: "Jazz" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("allows admin to rename a genre", async () => {
    const genre = await createGenre.execute({ userId: adminId, name: "Rock" });
    const updated = await useCase.execute({ userId: adminId, id: genre.id, name: "  Jazz  " });
    expect(updated.id).toBe(genre.id);
    expect(updated.name).toBe("Jazz");
  });

  it("allows renaming to the same name", async () => {
    const genre = await createGenre.execute({ userId: adminId, name: "Rock" });
    const updated = await useCase.execute({ userId: adminId, id: genre.id, name: "rock" });
    expect(updated.name).toBe("rock");
  });

  it("rejects a duplicate name on another genre", async () => {
    const rock = await createGenre.execute({ userId: adminId, name: "Rock" });
    await createGenre.execute({ userId: adminId, name: "Jazz" });
    await expect(useCase.execute({ userId: adminId, id: rock.id, name: "jazz" })).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});
