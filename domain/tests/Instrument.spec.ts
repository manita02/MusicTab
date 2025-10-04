import { describe, it, expect } from "vitest";
import { Instrument } from "../src/entities/Instrument";
import { DomainError } from "../src/errors/DomainError";

describe("Instrument entity (domain TDD)", () => {
  it("creates a valid instrument", () => {
    const instrument = Instrument.create(1, "Guitar");
    expect(instrument.id).toBe(1);
    expect(instrument.name).toBe("Guitar");
  });

  it("throws error if name is empty", () => {
    expect(() => Instrument.create(2, "")).toThrow(DomainError);
  });

  it("rehydrates an instrument from DB", () => {
    const instrument = Instrument.rehydrate(5, "Piano");
    expect(instrument.id).toBe(5);
    expect(instrument.name).toBe("Piano");
  });
});