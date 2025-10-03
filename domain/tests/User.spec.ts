import { describe, it, expect } from "vitest";
import { User, Role } from "../src/entities/User";
import { DomainError } from "../src/errors/DomainError";

describe("User entity (domain TDD)", () => {
  it("create a valid user with default values", () => {
    const user = User.create("felipe", "felipe@example.com", "hashed-secret");

    expect(user.id).toBeNull();
    expect(user.username).toBe("felipe");
    expect(user.email.toString()).toBe("felipe@example.com");
    expect(user.passwordHash).toBe("hashed-secret");
    expect(user.role).toBe(Role.USER);
    expect(user.isAdmin()).toBe(false);
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("create an administrator user explicitly", () => {
    const admin = User.create("root", "admin@example.com", "hashed-pass", Role.ADMIN);

    expect(admin.isAdmin()).toBe(true);
  });

  it("throws error if the username is too short", () => {
    expect(() => User.create("s", "short@example.com", "secret")).toThrow(DomainError);
  });

  it("throws error if the email is invalid", () => {
    expect(() => User.create("graciela", "invalid-email", "secret")).toThrow(DomainError);
  });

  it("rehydrate rebuilds a user from the database", () => {
    const persisted = User.rehydrate(
      42,
      "dbuser",
      "db@example.com",
      "hashed-dbpass",
      Role.USER,
      new Date("2024-01-01")
    );

    expect(persisted.id).toBe(42);
    expect(persisted.username).toBe("dbuser");
    expect(persisted.email.toString()).toBe("db@example.com");
    expect(persisted.passwordHash).toBe("hashed-dbpass");
    expect(persisted.createdAt).toEqual(new Date("2024-01-01"));
  });
});
