import { Email } from "../value-objects/Email";
import { DomainError } from "../errors/DomainError";

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export class User {
  private constructor(
    public readonly id: number | null,
    public readonly username: string,
    public readonly email: Email,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly createdAt: Date
  ) {}

  static create(username: string, emailStr: string, passwordHash: string, role: Role = Role.USER): User {
    if (username.length < 3) {
      throw new DomainError("Username must have at least 3 characters");
    }
    const email = Email.create(emailStr);
    return new User(null, username, email, passwordHash, role, new Date());
  }

  static rehydrate(
    id: number,
    username: string,
    emailStr: string,
    passwordHash: string,
    role: Role,
    createdAt: Date
  ): User {
    const email = Email.create(emailStr);
    return new User(id, username, email, passwordHash, role, createdAt);
  }

  isAdmin() {
    return this.role === Role.ADMIN;
  }
}
