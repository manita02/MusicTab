import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestUserController } from './controllers/test-user.controller';
import { UserPrismaRepository } from './repositories/user-prisma.repository';
import { PrismaService } from './prisma/prisma.service';

@Module({
  controllers: [AppController, TestUserController],
  providers: [AppService, UserPrismaRepository, PrismaService],
})
export class AppModule {}