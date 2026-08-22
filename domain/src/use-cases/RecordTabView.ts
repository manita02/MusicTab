import { ITabRepository } from "../repositories/ITabRepository";
import { NotFoundError } from "../errors/DomainError";

/** Ignore double-clicks; each intentional PDF open still counts. */
const DEDUP_WINDOW_MS = 2 * 1000;

export class RecordTabView {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(userId: number, tabId: number): Promise<{ counted: boolean }> {
    const tab = await this.tabRepo.findById(tabId);
    if (!tab) {
      throw new NotFoundError("Tab not found");
    }

    const lastViewedAt = await this.tabRepo.findLatestViewAt(userId, tabId);
    if (lastViewedAt && Date.now() - lastViewedAt.getTime() < DEDUP_WINDOW_MS) {
      return { counted: false };
    }

    await this.tabRepo.recordView(userId, tabId);
    return { counted: true };
  }
}
