import { Controller, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { SessionPrismaRepository } from '../repositories/session-prisma.repository';
import { PasswordHasherService } from '../services/password-hasher.service';
import { TokenService } from '../services/token.service';
import { RegisterUser } from '@domain/use-cases/RegisterUser';
import { LoginUser } from '@domain/use-cases/LoginUser';
import { DomainError } from '@domain/errors/DomainError';
import { User } from '@domain/entities/User';

type RegisterDTO = {
  username: string;
  email: string;
  password: string;
  birthDate: Date;
  urlImg: string;
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
};

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
    const user = await this.registerUser.execute({
      ...dto,
      birthDate: new Date(dto.birthDate),
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
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new DomainError('InvalidId', 'ID must be a number');
    }

    const user = await this.userRepo.findById(numericId);
    if (!user) throw new DomainError('UserNotFound', 'User not found');

    const updatedUser = User.rehydrate(
      user.id!,
      dto.username ?? user.username,
      dto.email ?? user.email.toString(),
      dto.password ? await this.passwordHasher.hash(dto.password) : user.passwordHash,
      user.role,
      user.createdAt,
      dto.birthDate ? new Date(dto.birthDate) : user.birthDate,
      dto.urlImg ?? user.urlImg.toString()
    );

    const savedUser = await this.userRepo.save(updatedUser);
    return savedUser;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new DomainError('InvalidId', 'ID must be a number');
    }

    const user = await this.userRepo.findById(numericId);
    if (!user) throw new DomainError('UserNotFound', 'User not found');

    await this.userRepo.deleteById(numericId);

    return { message: 'User deleted successfully' };
  }
}
