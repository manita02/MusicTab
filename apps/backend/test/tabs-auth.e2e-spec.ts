import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { authHeader, createE2eApp, seedE2eActors, seedE2eSecondAdmin } from './e2e-app';

function expectPublicTabRow(row: Record<string, unknown>) {
  expect(row).toHaveProperty('id');
  expect(row).toHaveProperty('title');
  expect(row).toHaveProperty('youtubeVideoId');
  expect(row).toHaveProperty('coverPath');
  expect(row).not.toHaveProperty('urlPdf');
  expect(row).not.toHaveProperty('urlYoutube');
  expect(row).not.toHaveProperty('urlImg');
}

async function catalogIds(app: INestApplication<App>) {
  const catalogs = await request(app.getHttpServer()).get('/catalogs/genres').expect(200);
  const instruments = await request(app.getHttpServer()).get('/catalogs/instruments').expect(200);
  const genreId = catalogs.body[0]?.id;
  const instrumentId = instruments.body[0]?.id;
  expect(genreId).toBeDefined();
  expect(instrumentId).toBeDefined();
  return { genreId, instrumentId };
}

function tabPayload(title: string, genreId: number, instrumentId: number, artist = 'E2E Admin') {
  return {
    title,
    artist,
    genreId,
    instrumentId,
    urlPdf: 'http://example.com/e2e.pdf',
    urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    urlImg: 'http://example.com/e2e.jpg',
  };
}

describe('Tabs authorization (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /catalogs/genres includes the Argentine catalog names', async () => {
    const res = await request(app.getHttpServer()).get('/catalogs/genres').expect(200);
    const names = (res.body as { name: string }[]).map((g) => g.name);
    for (const name of [
      'Tango',
      'Cumbia',
      'Salsa',
      'Milonga',
      'Chacarera',
      'Zamba',
      'Chamamé',
      'Cuarteto',
      'Folklore',
      'Latin',
    ]) {
      expect(names).toContain(name);
    }
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
    let admin2Token: string;
    let ownedTabId: number | null = null;
    let otherAdminTabId: number | null = null;
    let genreId: number;
    let instrumentId: number;

    beforeAll(async () => {
      const actors = await seedE2eActors(app);
      const admin2 = await seedE2eSecondAdmin(app);
      userToken = actors.user.token;
      adminToken = actors.admin.token;
      admin2Token = admin2.token;
      const catalogs = await catalogIds(app);
      genreId = catalogs.genreId;
      instrumentId = catalogs.instrumentId;
    });

    afterAll(async () => {
      if (ownedTabId != null && app && adminToken) {
        await request(app.getHttpServer()).delete(`/tabs/${ownedTabId}`).set(authHeader(adminToken));
      }
      if (otherAdminTabId != null && app && admin2Token) {
        await request(app.getHttpServer())
          .delete(`/tabs/${otherAdminTabId}`)
          .set(authHeader(admin2Token));
      }
    });

    it('USER can read the authenticated tab list', async () => {
      const res = await request(app.getHttpServer()).get('/tabs').set(authHeader(userToken)).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('USER cannot create, update or delete tabs', async () => {
      const payload = tabPayload(`e2e-user-forbidden-${Date.now()}`, 1, 1, 'E2E');
      await request(app.getHttpServer()).post('/tabs').set(authHeader(userToken)).send(payload).expect(403);
      await request(app.getHttpServer())
        .put('/tabs/1')
        .set(authHeader(userToken))
        .send({ title: 'hacked' })
        .expect(403);
      await request(app.getHttpServer()).delete('/tabs/1').set(authHeader(userToken)).expect(403);
    });

    it('ADMIN can create a tab', async () => {
      const res = await request(app.getHttpServer())
        .post('/tabs')
        .set(authHeader(adminToken))
        .send(tabPayload(`e2e-admin-create-${Date.now()}`, genreId, instrumentId));
      expect(res.status).toBe(201);
      ownedTabId = res.body.id;
      expect(res.body).toHaveProperty('urlPdf');
    });

    it('ADMIN can update their own tab', async () => {
      expect(ownedTabId).not.toBeNull();
      const updatedTitle = `e2e-admin-update-${Date.now()}`;
      const res = await request(app.getHttpServer())
        .put(`/tabs/${ownedTabId}`)
        .set(authHeader(adminToken))
        .send({ title: updatedTitle });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updatedTitle);
    });

    it('ADMIN cannot update or delete a tab created by another admin', async () => {
      const created = await request(app.getHttpServer())
        .post('/tabs')
        .set(authHeader(admin2Token))
        .send(tabPayload(`e2e-admin2-tab-${Date.now()}`, genreId, instrumentId, 'E2E Admin 2'));
      expect(created.status).toBe(201);
      otherAdminTabId = created.body.id;

      const putRes = await request(app.getHttpServer())
        .put(`/tabs/${otherAdminTabId}`)
        .set(authHeader(adminToken))
        .send({ title: 'should-not-overwrite' });
      expect(putRes.status).toBe(403);
      expect(putRes.body.code).toBe('AuthError');
      expect(putRes.body.message).toBe('You can only edit tabs you created');

      const deleteRes = await request(app.getHttpServer())
        .delete(`/tabs/${otherAdminTabId}`)
        .set(authHeader(adminToken));
      expect(deleteRes.status).toBe(403);
      expect(deleteRes.body.code).toBe('AuthError');
      expect(deleteRes.body.message).toBe('You can only delete tabs you created');

      const stillThere = await request(app.getHttpServer())
        .get(`/tabs/${otherAdminTabId}`)
        .set(authHeader(admin2Token))
        .expect(200);
      expect(stillThere.body.id).toBe(otherAdminTabId);
      expect(stillThere.body.title).not.toBe('should-not-overwrite');
    });

    it('ADMIN can delete their own tab', async () => {
      expect(ownedTabId).not.toBeNull();
      await request(app.getHttpServer())
        .delete(`/tabs/${ownedTabId}`)
        .set(authHeader(adminToken))
        .expect(200);
      await request(app.getHttpServer()).get(`/tabs/${ownedTabId}`).set(authHeader(adminToken)).expect(404);
      ownedTabId = null;
    });
  });
});
