import { IUserRepository } from "../repositories/IUserRepository";
import { ISessionRepository } from "../repositories/ISessionRepository";
import { IPasswordHasher } from "../services/IPasswordHasher";
import { ITokenService } from "../services/ITokenService";
import { Session } from "../entities/Session";
import { DomainError } from "../errors/DomainError";

type LoginDTO = {
  email: string;
  password: string;
  expiresInSeconds: number; // Expire Time Session
};

export class LoginUser {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
    private readonly sessionRepo: ISessionRepository
  ) {}

  async execute(dto: LoginDTO): Promise<Session> {
    const user = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (!user) throw new DomainError("LoginError", "User not found");

    const valid = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!valid) throw new DomainError("LoginError", "Invalid password");

    const token = await this.tokenService.generate({ userId: user.id }, dto.expiresInSeconds);
    const session = Session.create(token, user.id!, dto.expiresInSeconds);

    await this.sessionRepo.save(session);

    return session;
  }
}