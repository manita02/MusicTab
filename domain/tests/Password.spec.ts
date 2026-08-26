import { describe, it, expect } from "vitest";
import { Password, PASSWORD_POLICY_MESSAGE } from "../src/value-objects/Password";
import { DomainError } from "../src/errors/DomainError";

describe("Password policy", () => {
  it("accepts a strong password", () => {
    expect(Password.assert("Secret1!")).toBe("Secret1!");
  });

  it("rejects fewer than 8 characters", () => {
    expect(() => Password.assert("Ab1!x")).toThrow(DomainError);
  });

  it("rejects missing uppercase, lowercase, digit or special character", () => {
    expect(() => Password.assert("secret1!")).toThrow(DomainError);
    expect(() => Password.assert("SECRET1!")).toThrow(DomainError);
    expect(() => Password.assert("Secret!!")).toThrow(DomainError);
    expect(() => Password.assert("Secret12")).toThrow(DomainError);
  });

  it("uses a single policy message for composition failures", () => {
    try {
      Password.assert("secret");
      throw new Error("expected throw");
    } catch (err) {
      expect(err).toBeInstanceOf(DomainError);
      expect((err as DomainError).code).toBe("WeakPassword");
      expect((err as DomainError).message).toBe(PASSWORD_POLICY_MESSAGE);
    }
  });

  it("rejects passwords longer than 72 characters", () => {
    const tooLong = `Aa1!${"x".repeat(70)}`;
    expect(() => Password.assert(tooLong)).toThrow(DomainError);
  });
});
