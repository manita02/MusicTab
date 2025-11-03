import { ITabRepository } from "../repositories/ITabRepository";
import { DomainError } from "../errors/DomainError";
import { IUserRepository } from "../repositories/IUserRepository";

export class DeleteTab {
  constructor(
    private readonly tabRepo: ITabRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(id: number, userId: number): Promise<void> {
    const tab = await this.tabRepo.findById(id);
    if (!tab) {
      throw new DomainError("TabError", "Tab not found");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new DomainError("UserError", "User not found");
    }

    if (!user.isAdmin() && tab.userId !== user.id) {
      throw new DomainError("TabError", "You don't have permission to delete this tab");
    }

    await this.tabRepo.delete(id);
  }
}