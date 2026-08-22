import { CountCatalogParams, ITabRepository } from "../repositories/ITabRepository";

export type CountCatalogDTO = CountCatalogParams;

export class CountCatalog {
  constructor(private readonly tabRepo: ITabRepository) {}

  async execute(dto: CountCatalogDTO = {}): Promise<number> {
    return this.tabRepo.countCatalog({
      artist: dto.artist?.trim() || undefined,
      genreName: dto.genreName?.trim() || undefined,
      instrumentName: dto.instrumentName?.trim() || undefined,
    });
  }
}
