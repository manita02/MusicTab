import { ITabRepository, UserViewStats } from "../repositories/ITabRepository";

export class CountMyViews {
  constructor(private readonly tabRepo: ITabRepository) {}

  execute(userId: number): Promise<UserViewStats> {
    return this.tabRepo.countViewsByUser(userId);
  }
}
