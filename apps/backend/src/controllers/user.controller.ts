import { Controller, Post, Body, Put, Param, Delete, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { SessionPrismaRepository } from '../repositories/session-prisma.repository';
import { PasswordHasherService } from '../services/password-hasher.service';
import { TokenService } from '../services/token.service';
import { RegisterUser } from '@domain/use-cases/RegisterUser';
import { LoginUser } from '@domain/use-cases/LoginUser';
import { ListUsers } from '@domain/use-cases/ListUsers';
import { UpdateUser } from '@domain/use-cases/UpdateUser';
import { DeleteUser } from '@domain/use-cases/DeleteUser';
import { DomainError } from '@domain/errors/DomainError';
import { Role } from '@domain/entities/User';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { TurnstileService } from '../auth/turnstile.service';
import { extractClientIp } from '../auth/extract-client-ip';

type RegisterDTO = {
  username: string;
  email: string;
  emailConfirm: string;
  password: string;
  birthDate: Date;
  urlImg: string;
  turnstileToken: string;
};

type LoginDTO = {
  email: string;
  password: string;
  expiresInSeconds: number;
  urlImg: string;
};

type UpdateUserDTO = {
  username?: string;
  email?: string;
  password?: string;
  birthDate?: Date;
  urlImg?: string;
  role?: string;
};

@Controller('users')
export class UserController {
  private readonly registerUser: RegisterUser;
  private readonly loginUser: LoginUser;
  private readonly listUsers: ListUsers;
  private readonly updateUserUseCase: UpdateUser;
  private readonly deleteUserUseCase: DeleteUser;

  constructor(
    private readonly userRepo: UserPrismaRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly tokenService: TokenService,
    private readonly sessionRepo: SessionPrismaRepository,
    private readonly turnstile: TurnstileService,
  ) {
    this.registerUser = new RegisterUser(this.userRepo, this.passwordHasher);
    this.loginUser = new LoginUser(
      this.userRepo,
      this.passwordHasher,
      this.tokenService,
      this.sessionRepo,
    );
    this.listUsers = new ListUsers(this.userRepo);
    this.updateUserUseCase = new UpdateUser(this.userRepo, this.passwordHasher);
    this.deleteUserUseCase = new DeleteUser(this.userRepo);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  async list() {
    return this.listUsers.execute();
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDTO, @Req() req: Request) {
    const email = (dto.email ?? '').trim();
    const emailConfirm = (dto.emailConfirm ?? '').trim();
    if (email.toLowerCase() !== emailConfirm.toLowerCase()) {
      throw new DomainError('EmailMismatch', 'Email addresses do not match');
    }

    const ip = extractClientIp(req);
    await this.turnstile.verify(dto.turnstileToken, ip);

    const user = await this.registerUser.execute({
      username: dto.username,
      email,
      password: dto.password,
      birthDate: new Date(dto.birthDate),
      urlImg: dto.urlImg,
      signupIp: ip,
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      birthDate: user.birthDate,
      urlImg: user.urlImg.toString(),
    };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDTO) {
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
        userRole: user.role,
        userImg: user.urlImg.toString(),
        email: user.email.toString(),
        birthDate: user.birthDate,
      };
  }

  @Put(':id')
  async updateUser(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDTO,
  ) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new DomainError('InvalidId', 'ID must be a number');
    }

    return this.updateUserUseCase.execute({
      actorId: current.id,
      actorRole: current.role,
      targetId: numericId,
      username: dto.username,
      email: dto.email,
      password: dto.password,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      urlImg: dto.urlImg,
      role: dto.role,
    });
  }

  @Delete(':id')
  async deleteUser(@CurrentUser() current: RequestUser, @Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new DomainError('InvalidId', 'ID must be a number');
    }

    await this.deleteUserUseCase.execute({
      actorId: current.id,
      actorRole: current.role,
      targetId: numericId,
    });

    return { message: 'User deleted successfully' };
  }
}
