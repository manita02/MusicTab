import { describe, expect, it } from "vitest";
import { formatCooldownMmSs, remainingMsFromQuota } from "./copilotQuota";

describe("remainingMsFromQuota", () => {
  const now = Date.parse("2026-08-25T18:00:00.000Z");

  it("es 0 sin quota", () => {
    expect(remainingMsFromQuota(undefined, now)).toBe(0);
  });

  it("usa cooldownUntil si está en el futuro", () => {
    expect(
      remainingMsFromQuota(
        { cooldownUntil: "2026-08-25T18:00:47.000Z", cooldownRemainingMs: 1 },
        now,
      ),
    ).toBe(47_000);
  });

  it("cae a cooldownRemainingMs si no hay until", () => {
    expect(
      remainingMsFromQuota({ cooldownUntil: null, cooldownRemainingMs: 12_000 }, now),
    ).toBe(12_000);
  });
});

describe("formatCooldownMmSs", () => {
  it("formatea mm:ss con ceil a segundos", () => {
    expect(formatCooldownMmSs(47_000)).toBe("0:47");
    expect(formatCooldownMmSs(60_000)).toBe("1:00");
    expect(formatCooldownMmSs(0)).toBe("0:00");
  });
});
