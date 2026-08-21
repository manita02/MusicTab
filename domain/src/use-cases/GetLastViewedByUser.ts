import { ITabRepository } from "../repositories/ITabRepository";
import { CopilotTabHit } from "../dto/CopilotTabHit";

export class GetLastViewedByUser {
  constructor(private readonly tabRepo: ITabRepository) {}

  execute(userId: number): Promise<CopilotTabHit | null> {
    return this.tabRepo.findLastViewedByUser(userId);
  }
}
