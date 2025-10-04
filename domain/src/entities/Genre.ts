import { DomainError } from "../errors/DomainError";

export class Genre {
  private constructor(
    public readonly id: number,
    public readonly name: string
  ) {}

  static create(id: number, name: string): Genre {
    if (!name || name.trim().length === 0) {
      throw new DomainError("GenreError", "Genre name cannot be empty");
    }
    return new Genre(id, name);
  }

  static rehydrate(id: number, name: string): Genre {
    return new Genre(id, name);
  }
}
