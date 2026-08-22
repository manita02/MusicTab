import { describe, it, expect, beforeEach } from "vitest";
import { LoginUser } from "../src/use-cases/LoginUser";
import { User, Role } from "../src/entities/User";
import { Session } from "../src/entities/Session";
import { DomainError } from "../src/errors/DomainError";
import { ISessionRepository } from "../src/repositories/ISessionRepository";
import { IPasswordHasher } from "../src/services/IPasswordHasher";
import { ITokenService } from "../src/services/ITokenService";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";
  
  /** In-memory Session Repository */
  class InMemorySessionRepository implements ISessionRepository {
    private sessions: Session[] = [];
    async save(session: Session) {
      this.sessions.push(session);
    }
    async findByToken(token: string) {
      return this.sessions.find(s => s.token === token) ?? null;
    }
    async delete(token: string) {
      this.sessions = this.sessions.filter(s => s.token !== token);
    }
    async isTokenValid(tokenId: string): Promise<boolean> {
      const session = await this.findByToken(tokenId);
      return !!session && !session.isExpired();
    }
  }
  
  /** Fake Hasher */
  class FakeHasher implements IPasswordHasher {
    async hash(p: string) { return "hashed-" + p; }
    async compare(p: string, hash: string) { return hash === "hashed-" + p; }
  }
  
  /** Fake Token Service */
  class FakeTokenService implements ITokenService {
    async generate(payload: Record<string, any>, expiresInSeconds: number) {
      return "token-" + payload.userId;
    }
    async verify(token: string) {
      return { userId: parseInt(token.split("-")[1]) };
    }
  }

describe("LoginUser use-case", () => {
  let userRepo: InMemoryUserRepository;
  let sessionRepo: InMemorySessionRepository;
  let hasher: FakeHasher;
  let tokenService: FakeTokenService;
  let useCase: LoginUser;
  let user: User;

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    sessionRepo = new InMemorySessionRepository();
    hasher = new FakeHasher();
    tokenService = new FakeTokenService();
    useCase = new LoginUser(userRepo, hasher, tokenService, sessionRepo);

    user = await userRepo.save(
      User.create("pepe", "pepe@gmail.com", await hasher.hash("secret"), Role.USER, new Date("1990-01-01"), "https://example.com/a.png")
    );
  });

  it("logs in a user with correct credentials", async () => {
    const session = await useCase.execute({ email: "pepe@gmail.com", password: "secret", expiresInSeconds: 3600 });
    expect(session.userId).toBe(user.id);
    expect(session.isExpired()).toBe(false);
    expect(session.token).toBeDefined();
  });

  it("throws if user not found", async () => {
    await expect(useCase.execute({ email: "unknown@gmail.com", password: "secret", expiresInSeconds: 3600 }))
      .rejects.toThrow(DomainError);
  });

  it("throws if password is invalid", async () => {
    await expect(useCase.execute({ email: "pepe@gmail.com", password: "wrong", expiresInSeconds: 3600 }))
      .rejects.toThrow(DomainError);
  });
});