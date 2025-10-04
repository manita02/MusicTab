import { Genre } from "../entities/Genre";

export interface IGenreRepository {
  findById(id: number): Promise<Genre | null>;
  findAll(): Promise<Genre[]>;
}