import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserController } from './controllers/user.controller';
import { PrismaService } from './prisma/prisma.service';
import { AppService } from './app.service';
import { UserPrismaRepository } from './repositories/user-prisma.repository';
import { SessionPrismaRepository } from './repositories/session-prisma.repository';
import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';

@Module({
  controllers: [AppController, UserController],
  providers: [
    AppService,
    PrismaService,
    UserPrismaRepository,
    SessionPrismaRepository,
    PasswordHasherService,
    TokenService,
  ],
})
export class AppModule {}
