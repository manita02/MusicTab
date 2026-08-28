import { describe, it, expect, beforeEach } from "vitest";
import { CreateGenre } from "../src/use-cases/CreateGenre";
import { DeleteGenre } from "../src/use-cases/DeleteGenre";
import { Role, User } from "../src/entities/User";
import { ConflictError, NotFoundError } from "../src/errors/DomainError";
import { InMemoryGenreRepository } from "./fakes/InMemoryGenreRepository";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";

const birth = () => new Date("1995-06-01");
const img = () => "https://example.com/avatar.png";

describe("DeleteGenre use case", () => {
  let genreRepo: InMemoryGenreRepository;
  let userRepo: InMemoryUserRepository;
  let createGenre: CreateGenre;
  let useCase: DeleteGenre;
  let adminId: number;
  let userId: number;

  beforeEach(async () => {
    genreRepo = new InMemoryGenreRepository();
    userRepo = new InMemoryUserRepository();
    createGenre = new CreateGenre(genreRepo, userRepo);
    useCase = new DeleteGenre(genreRepo, userRepo);
    const user = await userRepo.save(User.create("user", "user@gmail.com", "hash", Role.USER, birth(), img()));
    const admin = await userRepo.save(User.create("admin", "admin@gmail.com", "hash", Role.ADMIN, birth(), img()));
    userId = user.id!;
    adminId = admin.id!;
  });

  it("rejects deletion for normal users", async () => {
    const genre = await createGenre.execute({ userId: adminId, name: "Rock" });
    await expect(useCase.execute({ userId, id: genre.id })).rejects.toMatchObject({ code: "AuthError" });
    expect(await genreRepo.findById(genre.id)).not.toBeNull();
  });

  it("rejects a missing genre", async () => {
    await expect(useCase.execute({ userId: adminId, id: 999 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("allows admin to delete an unused genre", async () => {
    const genre = await createGenre.execute({ userId: adminId, name: "Rock" });
    await useCase.execute({ userId: adminId, id: genre.id });
    expect(await genreRepo.findById(genre.id)).toBeNull();
  });

  it("rejects deleting a genre that is used by tabs", async () => {
    const genre = await createGenre.execute({ userId: adminId, name: "Rock" });
    genreRepo.setTabCount(genre.id, 2);
    await expect(useCase.execute({ userId: adminId, id: genre.id })).rejects.toBeInstanceOf(ConflictError);
    expect(await genreRepo.findById(genre.id)).not.toBeNull();
  });
});
