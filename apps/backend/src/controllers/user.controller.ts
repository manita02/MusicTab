import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { SessionPrismaRepository } from '../repositories/session-prisma.repository';
import { PasswordHasherService } from '../services/password-hasher.service';
import { TokenService } from '../services/token.service';
import { RegisterUser } from '@domain/use-cases/RegisterUser';
import { LoginUser } from '@domain/use-cases/LoginUser';
import { ConflictErrorFilter } from '../filters/conflict-error.filter';
import { DomainError } from '@domain/errors/DomainError';

type RegisterDTO = {
  username: string;
  email: string;
  password: string;
};

type LoginDTO = {
  email: string;
  password: string;
  expiresInSeconds: number;
};

@UseFilters(ConflictErrorFilter)
@Controller('users')
export class UserController {
  private readonly registerUser: RegisterUser;
  private readonly loginUser: LoginUser;

  constructor(
    private readonly userRepo: UserPrismaRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenService: TokenService,
    private readonly sessionRepo: SessionPrismaRepository,
  ) {
    this.registerUser = new RegisterUser(this.userRepo, this.passwordHasher);
    this.loginUser = new LoginUser(
      this.userRepo,
      this.passwordHasher,
      this.tokenService,
      this.sessionRepo,
    );
  }

  @Post('register')
  async register(@Body() dto: RegisterDTO) {
    const user = await this.registerUser.execute(dto);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDTO) {
    try {
      const session = await this.loginUser.execute(dto);
      const user = await this.userRepo.findById(session.userId);
      if (!user) {
        throw new DomainError('UserNotFound', 'User not found after login');
      }
      return {
        token: session.token,
        userId: session.userId,
        userName: user.username, 
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          error: error.name,
          message: error.message,
        };
      }
      throw error;
    }
  }
}
