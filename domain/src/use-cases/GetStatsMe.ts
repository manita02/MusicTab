import { CopilotTabHit } from "../dto/CopilotTabHit";
import { ITabRepository } from "../repositories/ITabRepository";
import { pickDistinctLeast } from "../stats.ranking";
import { STALE_AFTER_DAYS } from "./GetStaleViewedByUser";
import { STATS_LIST_LIMIT, STATS_RESULT_LIMIT, capTake } from "../stats.constants";

export type StatsMeDTO = {
  kpis: {
    events: number;
    distinctTabs: number;
    catalogTotal: number;
    coveragePct: number;
  };
  lastViewed: CopilotTabHit | null;
  most: CopilotTabHit[];
  least: CopilotTabHit[];
  never: CopilotTabHit[];
  stale: CopilotTabHit[];
};

export class GetStatsMe {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(userId: number): Promise<StatsMeDTO> {
    const bars = capTake(STATS_RESULT_LIMIT, STATS_RESULT_LIMIT);
    const list = capTake(STATS_LIST_LIMIT, STATS_LIST_LIMIT);

    const [views, catalogTotal, lastViewed, most, leastPool, never, stale] = await Promise.all([
      this.tabRepo.countViewsByUser(userId),
      this.tabRepo.countCatalog({}),
      this.tabRepo.findLastViewedByUser(userId),
      this.tabRepo.findTopViewedByUser(userId, "desc", bars),
      this.tabRepo.findTopViewedByUser(userId, "asc", list),
      this.tabRepo.findNeverViewedByUser(userId, list),
      this.tabRepo.findStaleViewedByUser(userId, STALE_AFTER_DAYS, list, { onlyStale: true }),
    ]);
    const least = pickDistinctLeast(most, leastPool, bars, true);

    const coveragePct =
      catalogTotal <= 0 ? 0 : Math.round((views.distinctTabs / catalogTotal) * 100);

    return {
      kpis: {
        events: views.events,
        distinctTabs: views.distinctTabs,
        catalogTotal,
        coveragePct,
      },
      lastViewed,
      most,
      least,
      never,
      stale,
    };
  }
}
