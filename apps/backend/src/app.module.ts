import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TestUserController } from './controllers/test-user.controller';
import { UserController } from './controllers/user.controller';
import { TabController } from './controllers/tab.controller';

import { PrismaService } from './prisma/prisma.service';

import { UserPrismaRepository } from './repositories/user-prisma.repository';
import { TabPrismaRepository } from './repositories/tab-prisma.repository';
import { SessionPrismaRepository } from './repositories/session-prisma.repository';

import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    TestUserController,
    UserController,
    TabController,
  ],
  providers: [
    AppService,
    PrismaService,
    UserPrismaRepository,
    TabPrismaRepository,
    SessionPrismaRepository,
    PasswordHasherService,
    TokenService,
  ],
})
export class AppModule {}
