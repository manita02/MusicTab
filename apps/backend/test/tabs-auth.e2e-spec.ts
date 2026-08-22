import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { authHeader, createE2eApp, seedE2eActors } from './e2e-app';

function expectPublicTabRow(row: Record<string, unknown>) {
  expect(row).toHaveProperty('id');
  expect(row).toHaveProperty('title');
  expect(row).toHaveProperty('youtubeVideoId');
  expect(row).toHaveProperty('coverPath');
  expect(row).not.toHaveProperty('urlPdf');
  expect(row).not.toHaveProperty('urlYoutube');
  expect(row).not.toHaveProperty('urlImg');
}

describe('Tabs authorization (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /tabs/public accepts anonymous clients without stored URLs', async () => {
    const res = await request(app.getHttpServer()).get('/tabs/public');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expectPublicTabRow(res.body[0]);
    }
  });

  it('GET /tabs/latest/public accepts anonymous clients without stored URLs', async () => {
    const res = await request(app.getHttpServer()).get('/tabs/latest/public').query({ limit: 2 });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body[0]) {
      expectPublicTabRow(res.body[0]);
    }
  });

  it('GET /tabs requires authentication', async () => {
    await request(app.getHttpServer()).get('/tabs').expect(401);
  });

  it('GET /tabs/:id requires authentication', async () => {
    await request(app.getHttpServer()).get('/tabs/1').expect(401);
  });

  it('GET /tabs/:id/download requires authentication', async () => {
    await request(app.getHttpServer()).get('/tabs/1/download').expect(401);
  });

  it('POST /tabs/:id/view requires authentication', async () => {
    await request(app.getHttpServer()).post('/tabs/1/view').expect(401);
  });

  it('POST /tabs rejects unauthenticated callers', async () => {
    await request(app.getHttpServer())
      .post('/tabs')
      .send({
        title: 'should-not-create',
        artist: 'Nope',
        genreId: 1,
        instrumentId: 1,
        urlPdf: 'http://example.com/a.pdf',
        urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        urlImg: 'http://example.com/i.jpg',
      })
      .expect(401);
  });

  describe('authenticated roles', () => {
    let userToken: string;
    let adminToken: string;
    let createdTabId: number | null = null;

    beforeAll(async () => {
      const actors = await seedE2eActors(app);
      userToken = actors.user.token;
      adminToken = actors.admin.token;
    });

    afterAll(async () => {
      if (createdTabId != null && app && adminToken) {
        await request(app.getHttpServer())
          .delete(`/tabs/${createdTabId}`)
          .set(authHeader(adminToken));
      }
    });

    it('USER can read the authenticated tab list', async () => {
      const res = await request(app.getHttpServer()).get('/tabs').set(authHeader(userToken)).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('USER cannot create, update or delete tabs', async () => {
      const payload = {
        title: `e2e-user-forbidden-${Date.now()}`,
        artist: 'E2E',
        genreId: 1,
        instrumentId: 1,
        urlPdf: 'http://example.com/a.pdf',
        urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        urlImg: 'http://example.com/i.jpg',
      };
      await request(app.getHttpServer()).post('/tabs').set(authHeader(userToken)).send(payload).expect(403);
      await request(app.getHttpServer())
        .put('/tabs/1')
        .set(authHeader(userToken))
        .send({ title: 'hacked' })
        .expect(403);
      await request(app.getHttpServer()).delete('/tabs/1').set(authHeader(userToken)).expect(403);
    });

    it('ADMIN can create a tab', async () => {
      const catalogs = await request(app.getHttpServer()).get('/catalogs/genres').expect(200);
      const instruments = await request(app.getHttpServer()).get('/catalogs/instruments').expect(200);
      const genreId = catalogs.body[0]?.id;
      const instrumentId = instruments.body[0]?.id;
      expect(genreId).toBeDefined();
      expect(instrumentId).toBeDefined();

      const res = await request(app.getHttpServer())
        .post('/tabs')
        .set(authHeader(adminToken))
        .send({
          title: `e2e-admin-create-${Date.now()}`,
          artist: 'E2E Admin',
          genreId,
          instrumentId,
          urlPdf: 'http://example.com/e2e.pdf',
          urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          urlImg: 'http://example.com/e2e.jpg',
        });
      expect(res.status).toBe(201);
      createdTabId = res.body.id;
      expect(res.body).toHaveProperty('urlPdf');
    });
  });
});
