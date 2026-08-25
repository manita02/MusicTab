import { describe, it, expect, beforeEach } from "vitest";
import { UpdateUser } from "../src/use-cases/UpdateUser";
import { Role, User } from "../src/entities/User";
import { ConflictError, DomainError, NotFoundError } from "../src/errors/DomainError";
import { IPasswordHasher } from "../src/services/IPasswordHasher";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";

const birth = () => new Date("1993-06-06");
const img = () => "https://example.com/u.png";

class FakeHasher implements IPasswordHasher {
  async hash(password: string) {
    return "hashed-" + password;
  }
  async compare(password: string, hash: string) {
    return hash === "hashed-" + password;
  }
}

describe("UpdateUser use case", () => {
  let repo: InMemoryUserRepository;
  let hasher: FakeHasher;
  let useCase: UpdateUser;
  let adminId: number;
  let userId: number;

  beforeEach(async () => {
    repo = new InMemoryUserRepository();
    hasher = new FakeHasher();
    useCase = new UpdateUser(repo, hasher);

    const admin = await repo.save(
      User.create("root", "admin@gmail.com", "hashed-admin", Role.ADMIN, birth(), img(), "127.0.0.1"),
    );
    const user = await repo.save(
      User.create("pepe", "pepe@gmail.com", "hashed-secret", Role.USER, birth(), img(), "203.0.113.10"),
    );
    adminId = admin.id!;
    userId = user.id!;
  });

  it("lets a USER update their own profile without changing role", async () => {
    const updated = await useCase.execute({
      actorId: userId,
      actorRole: Role.USER,
      targetId: userId,
      username: "pepe2",
    });

    expect(updated.username).toBe("pepe2");
    expect(updated.role).toBe(Role.USER);
    expect(updated).not.toHaveProperty("passwordHash");
    expect(updated).not.toHaveProperty("signupIp");
  });

  it("forbids a USER from updating another account", async () => {
    await expect(
      useCase.execute({
        actorId: userId,
        actorRole: Role.USER,
        targetId: adminId,
        username: "hacked",
      }),
    ).rejects.toMatchObject({ code: "AuthError" });
  });

  it("forbids a USER from changing their role", async () => {
    await expect(
      useCase.execute({
        actorId: userId,
        actorRole: Role.USER,
        targetId: userId,
        role: Role.ADMIN,
      }),
    ).rejects.toMatchObject({ code: "AuthError" });
  });

  it("lets an ADMIN update another user and change their role", async () => {
    const updated = await useCase.execute({
      actorId: adminId,
      actorRole: Role.ADMIN,
      targetId: userId,
      username: "pepe-admin",
      role: Role.ADMIN,
    });

    expect(updated.username).toBe("pepe-admin");
    expect(updated.role).toBe(Role.ADMIN);
    expect(updated.signupIp).toBe("203.0.113.10");
  });

  it("hashes a new password when provided", async () => {
    await useCase.execute({
      actorId: adminId,
      actorRole: Role.ADMIN,
      targetId: userId,
      password: "N3w-pass!",
    });

    const stored = await repo.findById(userId);
    expect(stored?.passwordHash).toBe("hashed-N3w-pass!");
  });

  it("rejects a weak password when updating", async () => {
    await expect(
      useCase.execute({
        actorId: adminId,
        actorRole: Role.ADMIN,
        targetId: userId,
        password: "weak",
      }),
    ).rejects.toMatchObject({ code: "WeakPassword" });
    const stored = await repo.findById(userId);
    expect(stored?.passwordHash).toBe("hashed-secret");
  });

  it("rejects a missing target", async () => {
    await expect(
      useCase.execute({
        actorId: adminId,
        actorRole: Role.ADMIN,
        targetId: 999,
        username: "ghost",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a username already taken by someone else", async () => {
    await expect(
      useCase.execute({
        actorId: adminId,
        actorRole: Role.ADMIN,
        targetId: userId,
        username: "root",
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects demoting the last administrator", async () => {
    await expect(
      useCase.execute({
        actorId: adminId,
        actorRole: Role.ADMIN,
        targetId: adminId,
        role: Role.USER,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("allows demoting an admin when another admin remains", async () => {
    await useCase.execute({
      actorId: adminId,
      actorRole: Role.ADMIN,
      targetId: userId,
      role: Role.ADMIN,
    });

    const demoted = await useCase.execute({
      actorId: adminId,
      actorRole: Role.ADMIN,
      targetId: userId,
      role: Role.USER,
    });

    expect(demoted.role).toBe(Role.USER);
  });

  it("rejects an invalid role string", async () => {
    await expect(
      useCase.execute({
        actorId: adminId,
        actorRole: Role.ADMIN,
        targetId: userId,
        role: "SUPER",
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
