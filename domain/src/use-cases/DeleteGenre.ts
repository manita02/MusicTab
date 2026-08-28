import { DomainError, ConflictError, NotFoundError } from "../errors/DomainError";
import { IGenreRepository } from "../repositories/IGenreRepository";
import { IUserRepository } from "../repositories/IUserRepository";

type DeleteGenreDTO = {
  userId: number;
  id: number;
};

export class DeleteGenre {
  constructor(
    private readonly genreRepo: IGenreRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(dto: DeleteGenreDTO): Promise<void> {
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

    const tabCount = await this.genreRepo.countTabsByGenreId(dto.id);
    if (tabCount > 0) {
      throw new ConflictError("Cannot delete a genre that is used by existing tabs");
    }

    await this.genreRepo.delete(dto.id);
  }
}
