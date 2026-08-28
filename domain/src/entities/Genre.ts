import { DomainError } from "../errors/DomainError";

export class Genre {
  private constructor(
    public readonly id: number,
    public readonly name: string
  ) {}

  static create(id: number, name: string): Genre {
    const trimmed = name?.trim() ?? "";
    if (!trimmed) {
      throw new DomainError("GenreError", "Genre name cannot be empty");
    }
    return new Genre(id, trimmed);
  }

  /** Unsaved genre (id 0 until the repository assigns one). */
  static createNew(name: string): Genre {
    return Genre.create(0, name);
  }

  static rehydrate(id: number, name: string): Genre {
    return new Genre(id, name);
  }

  rename(name: string): Genre {
    return Genre.create(this.id, name);
  }
}
