import { DomainError } from "../errors/DomainError";

export class Url {
    private constructor(private readonly value: string) {}
  
    public static create(url: string): Url {
      if (!url || !/^https?:\/\/.+/.test(url)) {
        throw new DomainError("InvalidUrl", "The URL format is invalid");
      }
      return new Url(url);
    }
  
    public getValue(): string {
      return this.value;
    }
}  