import { describe, it, expect } from "vitest";
import { User, Role } from "../src/entities/User";
import { DomainError } from "../src/errors/DomainError";

const birth = () => new Date("1993-06-06");
const img = () => "https://example.com/u.png";

describe("User entity (domain TDD)", () => {
  it("create a valid user with default values", () => {
    const user = User.create("felipe", "felipe@gmail.com", "hashed-secret", Role.USER, birth(), img());

    expect(user.id).toBeNull();
    expect(user.username).toBe("felipe");
    expect(user.email.toString()).toBe("felipe@gmail.com");
    expect(user.passwordHash).toBe("hashed-secret");
    expect(user.role).toBe(Role.USER);
    expect(user.isAdmin()).toBe(false);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.signupIp).toBeNull();
  });

  it("create an administrator user explicitly", () => {
    const admin = User.create("root", "admin@gmail.com", "hashed-pass", Role.ADMIN, birth(), img(), "127.0.0.1");

    expect(admin.isAdmin()).toBe(true);
    expect(admin.signupIp).toBe("127.0.0.1");
  });

  it("throws error if the username is too short", () => {
    expect(() => User.create("s", "short@outlook.com", "secret", Role.USER, birth(), img())).toThrow(
      DomainError,
    );
  });

  it("throws error if the email is invalid", () => {
    expect(() => User.create("graciela", "invalid-email", "secret", Role.USER, birth(), img())).toThrow(
      DomainError,
    );
  });

  it("rehydrate rebuilds a user from the database", () => {
    const persisted = User.rehydrate(
      42,
      "dbuser",
      "db@gmail.com",
      "hashed-dbpass",
      Role.USER,
      new Date("2024-01-01"),
      birth(),
      img(),
      "10.0.0.8",
    );

    expect(persisted.id).toBe(42);
    expect(persisted.username).toBe("dbuser");
    expect(persisted.email.toString()).toBe("db@gmail.com");
    expect(persisted.passwordHash).toBe("hashed-dbpass");
    expect(persisted.createdAt).toEqual(new Date("2024-01-01"));
    expect(persisted.signupIp).toBe("10.0.0.8");
  });
});
