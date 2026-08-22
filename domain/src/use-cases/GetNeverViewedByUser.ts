import { ITabRepository } from "../repositories/ITabRepository";
import { CopilotTabHit } from "../dto/CopilotTabHit";
import { COPILOT_RESULT_LIMIT } from "./SearchTabs";

export class GetNeverViewedByUser {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(userId: number, take: number = COPILOT_RESULT_LIMIT): Promise<CopilotTabHit[]> {
    const capped = Math.min(Math.max(take, 1), COPILOT_RESULT_LIMIT);
    return this.tabRepo.findNeverViewedByUser(userId, capped);
  }
}
