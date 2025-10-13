import { Module } from '@nestjs/common';
import { TestUserController } from './controllers/test-user.controller';
import { PrismaService } from './prisma/prisma.service';
import { UserPrismaRepository } from './repositories/user-prisma.repository';

@Module({
  controllers: [TestUserController],
  providers: [UserPrismaRepository, PrismaService],
})
export class AppModule {}

