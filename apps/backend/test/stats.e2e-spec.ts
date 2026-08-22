import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Stats (e2e)', () => {
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

  it('GET /stats/global accepts anonymous clients', async () => {
    const res = await request(app.getHttpServer()).get('/stats/global').query({ take: 3 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('most');
    expect(res.body).toHaveProperty('least');
    expect(Array.isArray(res.body.most)).toBe(true);
    expect(Array.isArray(res.body.least)).toBe(true);
    if (res.body.most[0]) {
      expect(res.body.most[0]).toHaveProperty('title');
      expect(res.body.most[0]).not.toHaveProperty('urlPdf');
      expect(res.body.most[0]).not.toHaveProperty('urlYoutube');
    }
    if (res.body.least[0]) {
      expect(res.body.least[0].viewCount).toBeGreaterThan(0);
    }
  });

  it('GET /stats/me requires authentication', async () => {
    await request(app.getHttpServer()).get('/stats/me').expect(401);
  });
});
