import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Tabs authorization (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /tabs/public accepts anonymous clients', async () => {
    const res = await request(app.getHttpServer()).get('/tabs/public');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const row = res.body[0];
      expect(row).toHaveProperty('id');
      expect(row).toHaveProperty('title');
      expect(row).toHaveProperty('userName');
      expect(row).toHaveProperty('youtubeVideoId');
      expect(row).toHaveProperty('coverPath');
      expect(row).not.toHaveProperty('urlPdf');
      expect(row).not.toHaveProperty('urlYoutube');
      expect(row).not.toHaveProperty('urlImg');
      expect(row).toHaveProperty('genreId');
      expect(row).toHaveProperty('instrumentId');
    }
  });

  it('GET /tabs requires authentication', async () => {
    await request(app.getHttpServer()).get('/tabs').expect(401);
  });

  it('GET /tabs/:id/download requires authentication', async () => {
    await request(app.getHttpServer()).get('/tabs/1/download').expect(401);
  });

  it('POST /tabs/:id/view requires authentication', async () => {
    await request(app.getHttpServer()).post('/tabs/1/view').expect(401);
  });

  it('GET /tabs/latest/public accepts anonymous clients', async () => {
    const res = await request(app.getHttpServer()).get('/tabs/latest/public').query({ limit: 2 });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /tabs rejects unauthenticated callers', async () => {
    await request(app.getHttpServer())
      .post('/tabs')
      .send({
        title: 'should-not-create',
        genreId: 1,
        instrumentId: 1,
        urlPdf: 'http://example.com/a.pdf',
        urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        urlImg: 'http://example.com/i.jpg',
      })
      .expect(401);
  });
});
