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

  it("throws error if name is only whitespace", () => {
    expect(() => Genre.create(1, "   ")).toThrow(DomainError);
  });

  it("trims the name", () => {
    expect(Genre.create(1, "  Rock  ").name).toBe("Rock");
  });

  it("creates an unsaved genre with id 0", () => {
    const genre = Genre.createNew("Jazz");
    expect(genre.id).toBe(0);
    expect(genre.name).toBe("Jazz");
  });

  it("renames a genre keeping the same id", () => {
    const renamed = Genre.create(4, "Rock").rename("Jazz");
    expect(renamed.id).toBe(4);
    expect(renamed.name).toBe("Jazz");
  });

  it("rehydrates a genre from DB", () => {
    const genre = Genre.rehydrate(10, "Jazz");
    expect(genre.id).toBe(10);
    expect(genre.name).toBe("Jazz");
  });
});
