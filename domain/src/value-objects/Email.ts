import { DomainError } from "../errors/DomainError";

export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      throw new DomainError("InvalidEmail", "The email format is invalid");
    }
    return new Email(email.toLowerCase());
  }

  toString() {
    return this.value;
  }
}

  