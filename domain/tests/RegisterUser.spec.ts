import { describe, it, expect, beforeEach } from "vitest";
import { RegisterUser } from "../src/use-cases/RegisterUser";
import { IPasswordHasher } from "../src/services/IPasswordHasher";
import { User, Role } from "../src/entities/User";
import { ConflictError, DomainError } from "../src/errors/DomainError";
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

const payload = (overrides: Partial<{ username: string; email: string; password: string; signupIp: string }> = {}) => ({
  username: "pepe",
  email: "pepe@gmail.com",
  password: "secret",
  birthDate: birth(),
  urlImg: img(),
  signupIp: "203.0.113.10",
  ...overrides,
});

describe("RegisterUser use case (domain TDD)", () => {
  let repo: InMemoryUserRepository;
  let hasher: FakeHasher;
  let useCase: RegisterUser;

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    hasher = new FakeHasher();
    useCase = new RegisterUser(repo, hasher);
  });

  it("registers a new user when the IP is free", async () => {
    const user = await useCase.execute(payload());

    expect(user.id).toBe(1);
    expect(user.email.toString()).toBe("pepe@gmail.com");
    expect(user.passwordHash).toBe("hashed-secret");
    expect(user.isAdmin()).toBe(false);
    expect(user.signupIp).toBe("203.0.113.10");
  });

  it("throws when email already exists", async () => {
    await useCase.execute(payload());

    await expect(
      useCase.execute(payload({ username: "pepe2", email: "pepe@gmail.com", signupIp: "203.0.113.11" })),
    ).rejects.toThrow(ConflictError);
  });

  it("throws when username already exists", async () => {
    await useCase.execute(payload());

    await expect(
      useCase.execute(payload({ username: "pepe", email: "otro@gmail.com", signupIp: "203.0.113.11" })),
    ).rejects.toThrow(ConflictError);
  });

  it("blocks a second USER signup from the same IP", async () => {
    await useCase.execute(payload());

    await expect(
      useCase.execute(payload({ username: "pepe2", email: "pepe2@gmail.com" })),
    ).rejects.toThrow(ConflictError);
  });

  it("allows a second signup when the IP belongs to an ADMIN", async () => {
    await repo.save(
      User.create("root", "admin@gmail.com", "hashed-admin", Role.ADMIN, birth(), img(), "203.0.113.10"),
    );

    const user = await useCase.execute(payload({ username: "pepe", email: "pepe@gmail.com" }));
    expect(user.email.toString()).toBe("pepe@gmail.com");
    expect(user.signupIp).toBe("203.0.113.10");
  });

  it("treats 127.0.0.1 and ::1 as the same network", async () => {
    await useCase.execute(payload({ signupIp: "127.0.0.1" }));
    await expect(
      useCase.execute(payload({ username: "pepe2", email: "pepe2@gmail.com", signupIp: "::1" })),
    ).rejects.toThrow(ConflictError);
  });

  it("does not save disposable / allowlist / legacy admin emails", async () => {
    await expect(useCase.execute(payload({ email: "pepe@mailinator.com" }))).rejects.toThrow(DomainError);
    await expect(useCase.execute(payload({ email: "pepe@empresa-inventada.xyz" }))).rejects.toThrow(DomainError);
    await expect(useCase.execute(payload({ email: "admin@admin.com" }))).rejects.toThrow(DomainError);
    expect(await repo.findByEmail("pepe@mailinator.com")).toBeNull();
  });

  it("rejects missing signup IP", async () => {
    await expect(useCase.execute(payload({ signupIp: "unknown" }))).rejects.toThrow(DomainError);
  });
});
