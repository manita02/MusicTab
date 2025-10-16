import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { RegisterUser } from '@domain/use-cases/RegisterUser';
import { PasswordHasherService } from '../services/password-hasher.service';
import { ConflictErrorFilter } from '../filters/conflict-error.filter';

type RegisterDTO = {
  username: string;
  email: string;
  password: string;
};

@UseFilters(ConflictErrorFilter)
@Controller('users')
export class UserController {
  private readonly registerUser: RegisterUser;

  constructor(
    private readonly userRepo: UserPrismaRepository,
    private readonly passwordHasher: PasswordHasherService
  ) {
    this.registerUser = new RegisterUser(this.userRepo, this.passwordHasher);
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
}