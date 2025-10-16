import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TestUserController } from './controllers/test-user.controller';
import { UserController } from './controllers/user.controller';
import { UserPrismaRepository } from './repositories/user-prisma.repository';
import { PrismaService } from './prisma/prisma.service';
import { PasswordHasherService } from './services/password-hasher.service';
import { AppService } from './app.service';

@Module({
  controllers: [AppController, TestUserController, UserController],
  providers: [
    AppService,
    UserPrismaRepository,
    PrismaService,
    PasswordHasherService,
  ],
})
export class AppModule {}
