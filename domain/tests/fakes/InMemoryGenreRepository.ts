import { Genre } from "../../src/entities/Genre";
import { IGenreRepository } from "../../src/repositories/IGenreRepository";

export class InMemoryGenreRepository implements IGenreRepository {
  private genres: Genre[] = [];
  private nextId = 1;
  private tabCounts = new Map<number, number>();

  async findAll(): Promise<Genre[]> {
    return [...this.genres].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: number): Promise<Genre | null> {
    return this.genres.find((genre) => genre.id === id) ?? null;
  }

  async findByName(name: string): Promise<Genre | null> {
    const normalized = name.trim().toLowerCase();
    return this.genres.find((genre) => genre.name.toLowerCase() === normalized) ?? null;
  }

  async save(genre: Genre): Promise<Genre> {
    if (genre.id > 0) {
      const index = this.genres.findIndex((row) => row.id === genre.id);
      if (index >= 0) {
        this.genres[index] = genre;
        return genre;
      }
    }

    const saved = Genre.rehydrate(this.nextId++, genre.name);
    this.genres.push(saved);
    return saved;
  }

  async delete(id: number): Promise<void> {
    this.genres = this.genres.filter((genre) => genre.id !== id);
  }

  async countTabsByGenreId(id: number): Promise<number> {
    return this.tabCounts.get(id) ?? 0;
  }

  setTabCount(genreId: number, count: number): void {
    this.tabCounts.set(genreId, count);
  }
}
