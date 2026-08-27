import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DomainErrorFilter } from './filters/conflict-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigin =
    configService
      .get<string>('CORS_ORIGIN')
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];
  const corsOrigins = corsOrigin.length > 0 ? corsOrigin : ['http://localhost:5173'];

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  app.useGlobalFilters(new DomainErrorFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}, CORS enabled for ${corsOrigins.join(', ')}`);
}

bootstrap();