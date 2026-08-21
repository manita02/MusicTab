import { ITabRepository } from "../repositories/ITabRepository";
import { CopilotTabHit } from "../dto/CopilotTabHit";
import { COPILOT_RESULT_LIMIT } from "./SearchTabs";

export const STALE_AFTER_DAYS = 7;

export class GetStaleViewedByUser {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(
    userId: number,
    staleAfterDays: number = STALE_AFTER_DAYS,
    take: number = COPILOT_RESULT_LIMIT
  ): Promise<CopilotTabHit[]> {
    const capped = Math.min(Math.max(take, 1), COPILOT_RESULT_LIMIT);
    const days = staleAfterDays > 0 ? staleAfterDays : STALE_AFTER_DAYS;
    return this.tabRepo.findStaleViewedByUser(userId, days, capped);
  }
}
