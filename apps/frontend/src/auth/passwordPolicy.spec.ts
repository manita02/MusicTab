import { describe, it, expect } from "vitest";
import { isStrongPassword } from "./passwordPolicy";

describe("passwordPolicy", () => {
  it("accepts a strong password", () => {
    expect(isStrongPassword("Secret1!")).toBe(true);
  });

  it("rejects weak passwords", () => {
    expect(isStrongPassword("secret")).toBe(false);
    expect(isStrongPassword("secret1!")).toBe(false);
    expect(isStrongPassword("SECRET1!")).toBe(false);
    expect(isStrongPassword("Secret!!")).toBe(false);
    expect(isStrongPassword("Secret12")).toBe(false);
    expect(isStrongPassword("Ab1!x")).toBe(false);
  });
});
