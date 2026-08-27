import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { UserController } from './controllers/user.controller';
import { TabController } from './controllers/tab.controller';
import { BackupController } from './backup/backup.controller';
import { BackupSqlService } from './backup/backup-sql.service';

import { PrismaModule } from './prisma/prisma.module';
import { CopilotModule } from './copilot/copilot.module';

import { UserPrismaRepository } from './repositories/user-prisma.repository';
import { TabPrismaRepository } from './repositories/tab-prisma.repository';
import { SessionPrismaRepository } from './repositories/session-prisma.repository';

import { PasswordHasherService } from './services/password-hasher.service';
import { TokenService } from './services/token.service';
import { AppService } from './app.service';
import { GenrePrismaRepository } from './repositories/genre-prisma.repository';
import { InstrumentPrismaRepository } from './repositories/instrument-prisma.repository';
import { CatalogController } from './controllers/catalog.controller';
import { StatsController } from './controllers/stats.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { TurnstileService } from './auth/turnstile.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'),
        join(process.cwd(), 'apps/backend/.env'),
        join(__dirname, '..', '.env'),
      ],
    }),
    PrismaModule,
    CopilotModule,
  ],
  controllers: [
    AppController,
    UserController,
    TabController,
    CatalogController,
    StatsController,
    BackupController,
  ],
  providers: [
    AppService,
    BackupSqlService,
    UserPrismaRepository,
    TabPrismaRepository,
    SessionPrismaRepository,
    GenrePrismaRepository,
    InstrumentPrismaRepository,
    PasswordHasherService,
    TokenService,
    TurnstileService,
    JwtAuthGuard,
    RolesGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
