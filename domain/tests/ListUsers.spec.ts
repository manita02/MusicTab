import { describe, it, expect, beforeEach } from "vitest";
import { ListUsers } from "../src/use-cases/ListUsers";
import { Role, User } from "../src/entities/User";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";

const birth = () => new Date("1993-06-06");
const img = () => "https://example.com/u.png";

describe("ListUsers use case", () => {
  let repo: InMemoryUserRepository;
  let useCase: ListUsers;

  beforeEach(async () => {
    repo = new InMemoryUserRepository();
    useCase = new ListUsers(repo);
    await repo.save(User.create("root", "admin@gmail.com", "hash-admin", Role.ADMIN, birth(), img(), "127.0.0.1"));
    await repo.save(User.create("pepe", "pepe@gmail.com", "hash-user", Role.USER, birth(), img(), "203.0.113.10"));
  });

  it("returns every user without passwordHash", async () => {
    const users = await useCase.execute();

    expect(users).toHaveLength(2);
    expect(users.map((u) => u.username).sort()).toEqual(["pepe", "root"]);
    for (const user of users) {
      expect(user).not.toHaveProperty("passwordHash");
      expect(user.email).toBeDefined();
      expect(user.role).toBeDefined();
    }
  });

  it("includes signupIp because the caller is already an admin endpoint", async () => {
    const users = await useCase.execute();
    const admin = users.find((u) => u.username === "root");
    expect(admin?.signupIp).toBe("127.0.0.1");
  });
});
