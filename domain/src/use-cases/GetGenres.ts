import { IGenreRepository } from "../repositories/IGenreRepository";
import { Genre } from "../entities/Genre";

export class GetGenres {
  constructor(private genreRepo: IGenreRepository) {}

  async execute(): Promise<Genre[]> {
    return this.genreRepo.findAll();
  }
}