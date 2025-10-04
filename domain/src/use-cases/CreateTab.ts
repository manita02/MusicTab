import { ITabRepository } from "../repositories/ITabRepository";
import { Tab } from "../entities/Tab";
import { DomainError } from "../errors/DomainError";
import { IUserRepository } from "../repositories/IUserRepository";

type CreateTabDTO = {
  title: string;
  userId: number;
  genreId: number;
  instrumentId: number;
  urlPdf: string;
  urlYoutube: string;
  urlImg: string;
};

export class CreateTab {
  constructor(
    private readonly tabRepo: ITabRepository,
    private readonly userRepo: IUserRepository
  ) {}

  async execute(dto: CreateTabDTO): Promise<Tab> {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) {
      throw new DomainError("UserError", "User not found");
    }

    if (!user.isAdmin()) {
      const today = new Date();
      const count = await this.tabRepo.countByUserAndDate(user.id!, today);
      if (count >= 3) {
        throw new DomainError("TabError", "Daily upload limit reached");
      }
    }

    const tab = Tab.create(
      dto.title,
      dto.userId,
      dto.genreId,
      dto.instrumentId,
      dto.urlPdf,
      dto.urlYoutube,
      dto.urlImg
    );

    const saved = await this.tabRepo.save(tab);
    return saved;
  }
}