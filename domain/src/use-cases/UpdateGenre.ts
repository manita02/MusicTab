import { Genre } from "../entities/Genre";
import { DomainError, ConflictError, NotFoundError } from "../errors/DomainError";
import { IGenreRepository } from "../repositories/IGenreRepository";
import { IUserRepository } from "../repositories/IUserRepository";

type UpdateGenreDTO = {
  userId: number;
  id: number;
  name: string;
};

export class UpdateGenre {
  constructor(
    private readonly genreRepo: IGenreRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: UpdateGenreDTO): Promise<Genre> {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) {
      throw new DomainError("UserError", "User not found");
    }
    if (!user.isAdmin()) {
      throw new DomainError("AuthError", "Only administrators can manage genres");
    }

    const current = await this.genreRepo.findById(dto.id);
    if (!current) {
      throw new NotFoundError("Genre not found");
    }

    const updated = current.rename(dto.name);
    const taken = await this.genreRepo.findByName(updated.name);
    if (taken && taken.id !== current.id) {
      throw new ConflictError("A genre with that name already exists");
    }

    return this.genreRepo.save(updated);
  }
}
