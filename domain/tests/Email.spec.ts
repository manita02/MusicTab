import { describe, it, expect } from "vitest";
import { Email } from "../src/value-objects/Email";
import { DomainError } from "../src/errors/DomainError";

describe("Email value object", () => {
  it.each([
    "pepe@gmail.com",
    "ana@outlook.com",
    "x@hotmail.com",
    "y@yahoo.com",
    "z@icloud.com",
    "a@proton.me",
    "admin@gmail.com",
  ])("accepts %s", (value) => {
    expect(Email.create(value).toString()).toBe(value.toLowerCase());
  });

  it("normalizes to lowercase", () => {
    expect(Email.create("Pepe@Gmail.COM").toString()).toBe("pepe@gmail.com");
  });

  it.each(["pepe@gmail", "pepe@@gmail.com", "", "not-an-email"])("rejects invalid format %s", (value) => {
    expect(() => Email.create(value)).toThrow(DomainError);
  });

  it("rejects disposable addresses", () => {
    expect(() => Email.create("pepe@mailinator.com")).toThrow(DomainError);
    expect(() => Email.create("pepe@yopmail.com")).toThrow(DomainError);
    try {
      Email.create("pepe@mailinator.com");
    } catch (err) {
      expect(err).toBeInstanceOf(DomainError);
      expect((err as DomainError).message).toBe("Disposable email addresses are not allowed");
    }
  });

  it("rejects plus aliases", () => {
    try {
      Email.create("pepe+tag@gmail.com");
      throw new Error("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(DomainError);
      expect((err as DomainError).message).toBe("Plus aliases are not allowed");
    }
  });

  it("rejects domains outside the allowlist", () => {
    try {
      Email.create("pepe@empresa-inventada.xyz");
      throw new Error("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(DomainError);
      expect((err as DomainError).message).toMatch(/well-known email provider/i);
    }
  });

  it("rejects admin@admin.com", () => {
    expect(() => Email.create("admin@admin.com")).toThrow(DomainError);
  });
});
