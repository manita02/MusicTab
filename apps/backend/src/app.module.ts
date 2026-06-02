import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { UserController } from './controllers/user.controller';
import { TabController } from './controllers/tab.controller';

import { PrismaService } from './prisma/prisma.service';

import { UserPrismaRepository } from './repositories/user-prisma.repository';
import { TabPrismaRepository } from './repositories/tab-prisma.repository';
import { SessionPrismaRepository } from './repositories/session-prisma.repository';

import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';
import { AppService } from './app.service';
import { GenrePrismaRepository } from './repositories/genre-prisma.repository';
import { InstrumentPrismaRepository } from './repositories/instrument-prisma.repository';
import { CatalogController } from './controllers/catalog.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    UserController,
    TabController,
    CatalogController
  ],
  providers: [
    AppService,
    PrismaService,
    UserPrismaRepository,
    TabPrismaRepository,
    SessionPrismaRepository,
    GenrePrismaRepository,
    InstrumentPrismaRepository,
    PasswordHasherService,
    TokenService,
    JwtAuthGuard,
    RolesGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
