import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Copilot auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /copilot/quota requiere JWT', async () => {
    await request(app.getHttpServer()).get('/copilot/quota').expect(401);
  });

  it('POST /copilot/chat requiere JWT', async () => {
    await request(app.getHttpServer())
      .post('/copilot/chat')
      .send({ message: '¿hay tabs de Milo J?' })
      .expect(401);
  });
});
