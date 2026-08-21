import { ITabRepository, TabSearchSort } from "../repositories/ITabRepository";
import { CopilotTabHit } from "../dto/CopilotTabHit";

export const COPILOT_RESULT_LIMIT = 3;

type SearchTabsDTO = {
  artist?: string;
  genreName?: string;
  instrumentName?: string;
  sort?: TabSearchSort;
  take?: number;
};

export class SearchTabs {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(dto: SearchTabsDTO = {}): Promise<CopilotTabHit[]> {
    const take = Math.min(Math.max(dto.take ?? COPILOT_RESULT_LIMIT, 1), COPILOT_RESULT_LIMIT);
    const artist = dto.artist?.trim();
    const genreName = dto.genreName?.trim();
    const instrumentName = dto.instrumentName?.trim();

    return this.tabRepo.search({
      artist: artist || undefined,
      genreName: genreName || undefined,
      instrumentName: instrumentName || undefined,
      sort: dto.sort ?? "recent",
      take,
    });
  }
}
