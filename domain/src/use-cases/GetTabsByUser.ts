import { ITabRepository } from "../repositories/ITabRepository";
import { CopilotTabHit } from "../dto/CopilotTabHit";
import { COPILOT_RESULT_LIMIT } from "./SearchTabs";

export class GetTabsByUser {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(
    userId: number,
    take: number = COPILOT_RESULT_LIMIT,
  ): Promise<{ hits: CopilotTabHit[]; total: number }> {
    const capped = Math.min(Math.max(take, 1), COPILOT_RESULT_LIMIT);
    const [hits, total] = await Promise.all([
      this.tabRepo.findHitsByUserId(userId, capped),
      this.tabRepo.countByUserId(userId),
    ]);
    return { hits, total };
  }
}
