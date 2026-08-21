import { ITabRepository, ViewOrder } from "../repositories/ITabRepository";
import { CopilotTabHit } from "../dto/CopilotTabHit";
import { COPILOT_RESULT_LIMIT } from "./SearchTabs";

export class GetTopViewedGlobal {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(
    order: ViewOrder = "desc",
    take: number = COPILOT_RESULT_LIMIT
  ): Promise<CopilotTabHit[]> {
    const capped = Math.min(Math.max(take, 1), COPILOT_RESULT_LIMIT);
    return this.tabRepo.findTopViewedGlobal(order, capped);
  }
}
