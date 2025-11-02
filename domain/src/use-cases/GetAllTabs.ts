import { ITabRepository } from "../repositories/ITabRepository";
import { Tab } from "../entities/Tab";

export class GetAllTabs {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(): Promise<Tab[]> {
    return this.tabRepo.findAll();
  }
}