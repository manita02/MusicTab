import { ITabRepository } from "../repositories/ITabRepository";
import { CountCatalog } from "./CountCatalog";

export class CountTabsByArtist {
  private readonly countCatalog: CountCatalog;

  constructor(tabRepo: ITabRepository) {
    this.countCatalog = new CountCatalog(tabRepo);
  }

  async execute(artist: string): Promise<number> {
    const trimmed = artist.trim();
    if (!trimmed) return 0;
    return this.countCatalog.execute({ artist: trimmed });
  }
}
