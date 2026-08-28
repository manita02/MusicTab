import { Genre } from "../entities/Genre";
import { DomainError, ConflictError } from "../errors/DomainError";
import { IGenreRepository } from "../repositories/IGenreRepository";
import { IUserRepository } from "../repositories/IUserRepository";

type CreateGenreDTO = {
  userId: number;
  name: string;
};

export class CreateGenre {
  constructor(
    private readonly genreRepo: IGenreRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: CreateGenreDTO): Promise<Genre> {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) {
      throw new DomainError("UserError", "User not found");
    }
    if (!user.isAdmin()) {
      throw new DomainError("AuthError", "Only administrators can manage genres");
    }

    const genre = Genre.createNew(dto.name);
    const existing = await this.genreRepo.findByName(genre.name);
    if (existing) {
      throw new ConflictError("A genre with that name already exists");
    }

    return this.genreRepo.save(genre);
  }
}
