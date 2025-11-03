// domain/use-cases/UpdateTab.ts
import { ITabRepository } from "../repositories/ITabRepository";
import { IUserRepository } from "../repositories/IUserRepository";
import { Tab } from "../entities/Tab";
import { DomainError } from "../errors/DomainError";

type UpdateTabDTO = {
  id: number;
  userId: number;
  title?: string;
  genreId?: number;
  instrumentId?: number;
  urlPdf?: string;
  urlYoutube?: string;
  urlImg?: string;
};

export class UpdateTab {
  constructor(
    private readonly tabRepo: ITabRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(dto: UpdateTabDTO): Promise<Tab> {
    const tab = await this.tabRepo.findById(dto.id);
    if (!tab) {
      throw new DomainError("TabError", "Tab not found");
    }

    const user = await this.userRepo.findById(dto.userId);
    if (!user) {
      throw new DomainError("UserError", "User not found");
    }
    
    if (!user.isAdmin() && tab.userId !== dto.userId) {
      throw new DomainError("AuthError", "You are not allowed to edit this tab");
    }

    const updatedTab = tab.update({
        title: dto.title,
        genreId: dto.genreId,
        instrumentId: dto.instrumentId,
        urlPdf: dto.urlPdf,
        urlYoutube: dto.urlYoutube,
        urlImg: dto.urlImg,
        });

      return await this.tabRepo.update(updatedTab);
    }
}