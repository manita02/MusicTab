import { DomainError } from "../errors/DomainError";

export class Session {
  private constructor(
    public readonly token: string,
    public readonly userId: number,
    public readonly expiresAt: Date
  ) {
    if (expiresAt.getTime() < Date.now()) {
      throw new DomainError("SessionError", "Expiration date cannot be in the past");
    }
  }

  static create(token: string, userId: number, expiresInSeconds: number): Session {
    if (!token || !userId) {
      throw new DomainError("SessionError", "Token and userId are required");
    }

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    return new Session(token, userId, expiresAt);
  }

  static rehydrate(token: string, userId: number, expiresAt: Date): Session {
    return new Session(token, userId, expiresAt);
  }

  isExpired(): boolean {
    return this.expiresAt.getTime() < Date.now();
  }
}