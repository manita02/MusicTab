import { Genre } from "../entities/Genre";

export interface IGenreRepository {
  findById(id: number): Promise<Genre | null>;
  findByName(name: string): Promise<Genre | null>;
  findAll(): Promise<Genre[]>;
  save(genre: Genre): Promise<Genre>;
  delete(id: number): Promise<void>;
  countTabsByGenreId(id: number): Promise<number>;
}
