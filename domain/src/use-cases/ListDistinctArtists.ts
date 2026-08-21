import { ITabRepository } from "../repositories/ITabRepository";

export class ListDistinctArtists {
  constructor(private readonly tabRepo: ITabRepository) {}

  execute(): Promise<string[]> {
    return this.tabRepo.listDistinctArtists();
  }
}
