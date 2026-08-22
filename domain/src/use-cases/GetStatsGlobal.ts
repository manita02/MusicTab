import { CopilotTabHit } from "../dto/CopilotTabHit";
import { ITabRepository } from "../repositories/ITabRepository";
import { pickDistinctLeast } from "../stats.ranking";
import { STATS_LIST_LIMIT, STATS_RESULT_LIMIT, capTake } from "../stats.constants";

export type StatsGlobalDTO = {
  most: CopilotTabHit[];
  least: CopilotTabHit[];
};

export class GetStatsGlobal {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(take: number = STATS_RESULT_LIMIT): Promise<StatsGlobalDTO> {
    const n = capTake(take, STATS_RESULT_LIMIT);
    const [most, leastPool] = await Promise.all([
      this.tabRepo.findTopViewedGlobal("desc", n, 1),
      this.tabRepo.findTopViewedGlobal("asc", STATS_LIST_LIMIT, 1),
    ]);
    return { most, least: pickDistinctLeast(most, leastPool, n, false) };
  }
}
