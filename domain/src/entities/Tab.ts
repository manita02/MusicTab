import { Url } from "../value-objects/Url";
import { DomainError } from "../errors/DomainError";
import { User } from "./User";

export class Tab {
  private constructor(
    public readonly id: number | null,
    public readonly title: string,
    public readonly userId: number,
    public readonly urlPdf: Url,
    public readonly urlYoutube: Url,
    public readonly urlImg: Url,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(
    title: string,
    userId: number,
    urlPdf: string,
    urlYoutube: string,
    urlImg: string
  ): Tab {
    if (!title || title.trim().length === 0) {
      throw new DomainError("TabError", "Title cannot be empty");
    }

    if (!urlPdf) {
      throw new DomainError("TabError", "PDF of tab is obligatory");
    }

    if (!urlYoutube) {
      throw new DomainError("TabError", "YouTube URL is obligatory");
    }

    if (!urlImg) {
      throw new DomainError("TabError", "Image URL is obligatory");
    }

    const pdf = Url.create(urlPdf);
    const youtube = Url.create(urlYoutube);
    const img = Url.create(urlImg);

    return new Tab(null, title, userId, pdf, youtube, img);
  }

  static rehydrate(
    id: number,
    title: string,
    userId: number,
    urlPdf: string,
    urlYoutube: string,
    urlImg: string,
    createdAt?: Date
  ): Tab {
    const pdf = Url.create(urlPdf);
    const youtube = Url.create(urlYoutube);
    const img = Url.create(urlImg);

    return new Tab(id, title, userId, pdf, youtube, img, createdAt ?? new Date());
  }

  canEdit(user: User): boolean {
    return user.isAdmin() || user.id === this.userId;
  }
}