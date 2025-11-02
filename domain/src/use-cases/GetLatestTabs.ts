import { ITabRepository } from "../repositories/ITabRepository";
import { Tab } from "../entities/Tab";

export class GetLatestTabs {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(limit: number = 8): Promise<Tab[]> {
    return this.tabRepo.findLatest(limit);
  }
}