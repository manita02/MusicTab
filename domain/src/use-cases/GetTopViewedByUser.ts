import { ITabRepository, ViewOrder } from "../repositories/ITabRepository";
import { CopilotTabHit } from "../dto/CopilotTabHit";
import { COPILOT_RESULT_LIMIT } from "./SearchTabs";

export class GetTopViewedByUser {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(
    userId: number,
    order: ViewOrder = "desc",
    take: number = COPILOT_RESULT_LIMIT
  ): Promise<CopilotTabHit[]> {
    const capped = Math.min(Math.max(take, 1), COPILOT_RESULT_LIMIT);
    return this.tabRepo.findTopViewedByUser(userId, order, capped);
  }
}
