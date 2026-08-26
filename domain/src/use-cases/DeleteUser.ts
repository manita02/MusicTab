import { Role } from "../entities/User";
import { ConflictError, DomainError, NotFoundError } from "../errors/DomainError";
import { IUserRepository } from "../repositories/IUserRepository";

export type DeleteUserInput = {
  actorId: number;
  actorRole: Role;
  targetId: number;
};

export class DeleteUser {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(dto: DeleteUserInput): Promise<void> {
    const actorIsAdmin = dto.actorRole === Role.ADMIN;
    if (!actorIsAdmin && dto.targetId !== dto.actorId) {
      throw new DomainError("AuthError", "You can only delete your own account");
    }

    const target = await this.userRepo.findById(dto.targetId);
    if (!target || target.id == null) {
      throw new NotFoundError("User not found");
    }

    if (target.isAdmin()) {
      const adminCount = (await this.userRepo.findAll()).filter((user) => user.isAdmin()).length;
      if (adminCount <= 1) {
        throw new ConflictError("Cannot delete the last administrator");
      }
    }

    await this.userRepo.deleteById(target.id);
  }
}
