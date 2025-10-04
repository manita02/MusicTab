import { describe, it, expect } from "vitest";
import { Session } from "../src/entities/Session";
import { DomainError } from "../src/errors/DomainError";

describe("Session entity (domain TDD)", () => {
  it("creates a valid session", () => {
    const session = Session.create("token123", 2, 3600);
    expect(session.userId).toBe(2);
    expect(session.isExpired()).toBe(false);
  });

  it("throws error if expiration date is in the past", () => {
    const pastDate = new Date(Date.now() - 10000);
    expect(() => Session.rehydrate("token", 1, pastDate)).toThrow(DomainError);
  });
});