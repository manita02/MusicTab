import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TestUserController } from './controllers/test-user.controller';
import { UserPrismaRepository } from './repositories/user-prisma.repository';

import { PrismaService } from './prisma/prisma.service';

@Module({
  controllers: [TestUserController],
  providers: [UserPrismaRepository, PrismaService],
})
class AppModule {}


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('NestJS app running on http://localhost:3000');
}
bootstrap();
