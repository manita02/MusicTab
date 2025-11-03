import { Url } from "../value-objects/Url";
import { DomainError } from "../errors/DomainError";
import { User } from "./User";

export class Tab {
  private constructor(
    public readonly id: number | null,
    public readonly title: string,
    public readonly userId: number,
    public readonly genreId: number,
    public readonly instrumentId: number,
    public readonly urlPdf: Url,
    public readonly urlYoutube: Url,
    public readonly urlImg: Url,
    public readonly createdAt: Date = new Date(),
    public readonly userName?: string
  ) {}

  static create(
    title: string,
    userId: number,
    genreId: number,
    instrumentId: number,
    urlPdf: string,
    urlYoutube: string,
    urlImg: string
  ): Tab {
    if (!title || title.trim().length === 0) {
      throw new DomainError("TabError", "Title cannot be empty");
    }

    if (!Number.isInteger(genreId) || genreId <= 0) {
      throw new DomainError("TabError", "Invalid genre ID");
    }

    if (!Number.isInteger(instrumentId) || instrumentId <= 0) {
      throw new DomainError("TabError", "Invalid instrument ID");
    }

    const pdf = Url.create(urlPdf, "PDF URL");
    const youtube = Url.create(urlYoutube, "YouTube URL");
    const img = Url.create(urlImg, "Image URL");

    return new Tab(null, title, userId, genreId, instrumentId, pdf, youtube, img);
  }

  static rehydrate(
    id: number,
    title: string,
    userId: number,
    genreId: number,
    instrumentId: number,
    urlPdf: string,
    urlYoutube: string,
    urlImg: string,
    createdAt?: Date,
    userName?: string
  ): Tab {
    const pdf = Url.create(urlPdf, "PDF URL");
    const youtube = Url.create(urlYoutube, "YouTube URL");
    const img = Url.create(urlImg, "Image URL");

    return new Tab(id, title, userId, genreId, instrumentId, pdf, youtube, img, createdAt ?? new Date(), userName);
  }

  canEdit(user: User): boolean {
    return user.isAdmin() || user.id === this.userId;
  }

  update(props: {
    title?: string;
    genreId?: number;
    instrumentId?: number;
    urlPdf?: string;
    urlYoutube?: string;
    urlImg?: string;
  }): Tab {
    return new Tab(
      this.id,
      props.title ?? this.title,
      this.userId,
      props.genreId ?? this.genreId,
      props.instrumentId ?? this.instrumentId,
      Url.create(props.urlPdf ?? this.urlPdf.toString(), "PDF URL"),
      Url.create(props.urlYoutube ?? this.urlYoutube.toString(), "YouTube URL"),
      Url.create(props.urlImg ?? this.urlImg.toString(), "Image URL"),
      this.createdAt,
      this.userName
    );
  }
}