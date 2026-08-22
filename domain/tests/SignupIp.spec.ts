import { describe, it, expect } from "vitest";
import { DomainError } from "../src/errors/DomainError";
import { normalizeSignupIp, signupIpLookupValues } from "../src/value-objects/SignupIp";

describe("SignupIp", () => {
  it("trims and strips IPv4-mapped IPv6", () => {
    expect(normalizeSignupIp("  ::ffff:127.0.0.1  ")).toBe("127.0.0.1");
  });

  it("rejects empty or unknown values", () => {
    expect(() => normalizeSignupIp("")).toThrow(DomainError);
    expect(() => normalizeSignupIp("unknown")).toThrow(DomainError);
  });

  it("looks up localhost v4 and v6 together", () => {
    expect(signupIpLookupValues("127.0.0.1")).toEqual(["127.0.0.1", "::1"]);
    expect(signupIpLookupValues("::1")).toEqual(["127.0.0.1", "::1"]);
    expect(signupIpLookupValues("203.0.113.10")).toEqual(["203.0.113.10"]);
  });
});
