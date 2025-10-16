import { Controller, Post, Body } from '@nestjs/common';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { User, Role } from '@domain/entities/User';

@Controller('test-user')
export class TestUserController {
  constructor(private readonly userRepo: UserPrismaRepository) {}

  @Post('create')
  async createUser(@Body() dto: { username: string; email: string; password: string }) {
    const user = User.create(dto.username, dto.email, dto.password, Role.USER);
    return this.userRepo.save(user);
  }
}
