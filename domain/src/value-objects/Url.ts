import { DomainError } from "../errors/DomainError";

export class Url {
  private constructor(private readonly value: string) {}

  public static create(url: string, fieldName?: string): Url {
    if (!url || !/^https?:\/\/.+/.test(url)) {
      const name = fieldName ? ` (${fieldName})` : '';
      throw new DomainError(
        "InvalidUrl",
        `The URL format is invalid${name}: ${url ?? 'empty'}`
      );
    }
    return new Url(url);
  }

  public getValue(): string {
    return this.value;
  }

  public toString(): string {
    return this.value;
  }
}