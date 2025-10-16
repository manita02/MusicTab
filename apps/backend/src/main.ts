import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConflictErrorFilter } from './filters/conflict-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ConflictErrorFilter());
  await app.listen(3000);
  console.log('NestJS app running on http://localhost:3000');
}

bootstrap();