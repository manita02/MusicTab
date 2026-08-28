import request from 'supertest';
import { App } from 'supertest/types';
import { INestApplication } from '@nestjs/common';
import { authHeader, createE2eApp, seedE2eActors } from './e2e-app';
import { PrismaService } from '../src/prisma/prisma.service';

function tabPayload(title: string, genreId: number, instrumentId: number) {
  return {
    title,
    artist: 'E2E Genre Artist',
    genreId,
    instrumentId,
    urlPdf: 'http://example.com/e2e-genre.pdf',
    urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    urlImg: 'http://example.com/e2e-genre.jpg',
  };
}

describe('Genre catalog mutations (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /catalogs/genres remains public', async () => {
    await request(app.getHttpServer()).get('/catalogs/genres').expect(200);
  });

  it('rejects unauthenticated and non-admin mutations', async () => {
    const actors = await seedE2eActors(app);
    const unique = `E2E-Genre-${Date.now()}`;

    await request(app.getHttpServer()).post('/catalogs/genres').send({ name: unique }).expect(401);

    await request(app.getHttpServer())
      .post('/catalogs/genres')
      .set(authHeader(actors.user.token))
      .send({ name: unique })
      .expect(403);
  });

  it('lets an admin create, rename, and delete an unused genre', async () => {
    const actors = await seedE2eActors(app);
    const stamp = Date.now();
    const createdName = `E2E-Genre-${stamp}`;
    const renamed = `E2E-Genre-Renamed-${stamp}`;

    const created = await request(app.getHttpServer())
      .post('/catalogs/genres')
      .set(authHeader(actors.admin.token))
      .send({ name: createdName })
      .expect(201);

    expect(created.body).toMatchObject({ name: createdName });
    expect(created.body.id).toBeDefined();

    const updated = await request(app.getHttpServer())
      .put(`/catalogs/genres/${created.body.id}`)
      .set(authHeader(actors.admin.token))
      .send({ name: renamed })
      .expect(200);

    expect(updated.body).toMatchObject({ id: created.body.id, name: renamed });

    await request(app.getHttpServer())
      .delete(`/catalogs/genres/${created.body.id}`)
      .set(authHeader(actors.admin.token))
      .expect(204);

    const list = await request(app.getHttpServer()).get('/catalogs/genres').expect(200);
    const names = (list.body as { name: string }[]).map((g) => g.name);
    expect(names).not.toContain(renamed);
  });

  it('blocks deleting a genre that is used by a tab', async () => {
    const actors = await seedE2eActors(app);
    const prisma = app.get(PrismaService);
    const stamp = Date.now();

    const created = await request(app.getHttpServer())
      .post('/catalogs/genres')
      .set(authHeader(actors.admin.token))
      .send({ name: `E2E-Used-Genre-${stamp}` })
      .expect(201);

    const instruments = await request(app.getHttpServer()).get('/catalogs/instruments').expect(200);
    const instrumentId = instruments.body[0]?.id;
    expect(instrumentId).toBeDefined();

    await request(app.getHttpServer())
      .post('/tabs')
      .set(authHeader(actors.admin.token))
      .send(tabPayload(`e2e-genre-tab-${stamp}`, created.body.id, instrumentId))
      .expect(201);

    const res = await request(app.getHttpServer())
      .delete(`/catalogs/genres/${created.body.id}`)
      .set(authHeader(actors.admin.token))
      .expect(409);

    expect(res.body.message).toMatch(/used by existing tabs/i);

    await prisma.tab.deleteMany({ where: { genreId: created.body.id } });
    await request(app.getHttpServer())
      .delete(`/catalogs/genres/${created.body.id}`)
      .set(authHeader(actors.admin.token))
      .expect(204);
  });
});
