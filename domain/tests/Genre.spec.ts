import { describe, it, expect } from "vitest";
import { Genre } from "../src/entities/Genre";
import { DomainError } from "../src/errors/DomainError";

describe("Genre entity (domain TDD)", () => {
  it("creates a valid genre", () => {
    const genre = Genre.create(1, "Rock");
    expect(genre.id).toBe(1);
    expect(genre.name).toBe("Rock");
  });

  it("throws error if name is empty", () => {
    expect(() => Genre.create(1, "")).toThrow(DomainError);
  });

  it("rehydrates a genre from DB", () => {
    const genre = Genre.rehydrate(10, "Jazz");
    expect(genre.id).toBe(10);
    expect(genre.name).toBe("Jazz");
  });
});
