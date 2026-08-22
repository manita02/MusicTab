import { Email } from "../value-objects/Email";
import { DomainError } from "../errors/DomainError";
import { Url } from "../value-objects/Url";

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
    public readonly createdAt: Date,
    public readonly birthDate: Date,
    public readonly urlImg: Url,
    public readonly signupIp: string | null,
  ) {}

  static create(
    username: string,
    emailStr: string,
    passwordHash: string,
    role: Role = Role.USER,
    birthDate: Date,
    urlImg: string,
    signupIp: string | null = null,
  ): User {
    if (username.length < 3) {
      throw new DomainError("Username must have at least 3 characters");
    }
    const email = Email.create(emailStr);
    const img = Url.create(urlImg, "Profile Image URL");
    const ip = signupIp?.trim() ? signupIp.trim() : null;
    return new User(null, username, email, passwordHash, role, new Date(), birthDate, img, ip);
  }

  static rehydrate(
    id: number,
    username: string,
    emailStr: string,
    passwordHash: string,
    role: Role,
    createdAt: Date,
    birthDate: Date,
    urlImg: string,
    signupIp: string | null = null,
  ): User {
    const email = Email.create(emailStr);
    const img = Url.create(urlImg, "Profile Image URL");
    const ip = signupIp?.trim() ? signupIp.trim() : null;
    return new User(id, username, email, passwordHash, role, createdAt, birthDate, img, ip);
  }

  isAdmin() {
    return this.role === Role.ADMIN;
  }
}
