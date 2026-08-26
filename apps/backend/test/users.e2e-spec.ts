import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { authHeader, createE2eApp, loginAs, seedE2eActors, upsertE2eUser } from './e2e-app';

describe('Users authorization (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createE2eApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /users requires authentication', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });

  describe('authenticated roles', () => {
    let userToken: string;
    let userId: number;
    let adminToken: string;
    let adminId: number;

    beforeAll(async () => {
      const actors = await seedE2eActors(app);
      userToken = actors.user.token;
      userId = actors.user.id;
      adminToken = actors.admin.token;
      adminId = actors.admin.id;
    });

    it('USER cannot list users', async () => {
      await request(app.getHttpServer()).get('/users').set(authHeader(userToken)).expect(403);
    });

    it('USER cannot change their own role', async () => {
      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set(authHeader(userToken))
        .send({ role: 'ADMIN' })
        .expect(403);
    });

    it('USER cannot edit another account', async () => {
      await request(app.getHttpServer())
        .put(`/users/${adminId}`)
        .set(authHeader(userToken))
        .send({ username: 'hacked-admin' })
        .expect(403);
    });

    it('ADMIN can list users', async () => {
      const res = await request(app.getHttpServer()).get('/users').set(authHeader(adminToken)).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((row: { id: number }) => row.id === userId)).toBe(true);
    });

    it('ADMIN can delete their own account when another admin remains', async () => {
      const prisma = app.get(PrismaService);
      const stamp = Date.now();
      const password = 'e2e-self-del-pass';
      const extraAdmin = await upsertE2eUser(prisma, {
        email: `e2eselfadmin${stamp}@gmail.com`,
        username: `e2eselfadmin${stamp}`,
        password,
        role: 'ADMIN',
      });
      const extraSession = await loginAs(app, extraAdmin.email, password);

      await request(app.getHttpServer())
        .delete(`/users/${extraAdmin.id}`)
        .set(authHeader(extraSession.token))
        .expect(200);

      expect(await prisma.user.findUnique({ where: { id: extraAdmin.id } })).toBeNull();
      expect(await prisma.user.findUnique({ where: { id: adminId } })).not.toBeNull();
    });

    describe('delete cascade', () => {
      async function catalogIds() {
        const catalogs = await request(app.getHttpServer()).get('/catalogs/genres').expect(200);
        const instruments = await request(app.getHttpServer()).get('/catalogs/instruments').expect(200);
        return { genreId: catalogs.body[0].id as number, instrumentId: instruments.body[0].id as number };
      }

      it('cascades sessions, tab views and copilot usage when deleting a USER', async () => {
        const prisma = app.get(PrismaService);
        const stamp = Date.now();
        const password = 'e2e-cascade-pass';
        const target = await upsertE2eUser(prisma, {
          email: `e2ecasuser${stamp}@gmail.com`,
          username: `e2ecasuser${stamp}`,
          password,
          role: 'USER',
        });
        const targetSession = await loginAs(app, target.email, password);

        const { genreId, instrumentId } = await catalogIds();
        const surviving = await request(app.getHttpServer())
          .post('/tabs')
          .set(authHeader(adminToken))
          .send({
            title: `e2e-survive-user-del-${stamp}`,
            artist: 'E2E Survive',
            genreId,
            instrumentId,
            urlPdf: 'http://example.com/e2e.pdf',
            urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            urlImg: 'http://example.com/e2e.jpg',
          });
        expect(surviving.status).toBe(201);
        const survivingTabId = surviving.body.id as number;

        await request(app.getHttpServer())
          .post(`/tabs/${survivingTabId}/view`)
          .set(authHeader(targetSession.token))
          .expect(200);

        await prisma.copilotDailyUsage.upsert({
          where: { userId_date: { userId: target.id, date: '2026-08-25' } },
          create: { userId: target.id, date: '2026-08-25', count: 2 },
          update: { count: 2 },
        });

        const genreCountBefore = await prisma.genre.count();
        const instrumentCountBefore = await prisma.instrument.count();
        expect(await prisma.session.count({ where: { userId: target.id } })).toBeGreaterThan(0);
        expect(await prisma.tabView.count({ where: { userId: target.id } })).toBeGreaterThan(0);
        expect(await prisma.copilotDailyUsage.count({ where: { userId: target.id } })).toBeGreaterThan(0);

        await request(app.getHttpServer())
          .delete(`/users/${target.id}`)
          .set(authHeader(adminToken))
          .expect(200);

        expect(await prisma.user.findUnique({ where: { id: target.id } })).toBeNull();
        expect(await prisma.session.count({ where: { userId: target.id } })).toBe(0);
        expect(await prisma.tabView.count({ where: { userId: target.id } })).toBe(0);
        expect(await prisma.copilotDailyUsage.count({ where: { userId: target.id } })).toBe(0);
        expect(await prisma.tab.findUnique({ where: { id: survivingTabId } })).not.toBeNull();
        expect(await prisma.genre.count()).toBe(genreCountBefore);
        expect(await prisma.instrument.count()).toBe(instrumentCountBefore);

        await request(app.getHttpServer())
          .delete(`/tabs/${survivingTabId}`)
          .set(authHeader(adminToken))
          .expect(200);
      });

      it('cascades published tabs and their views when deleting an extra admin', async () => {
        const prisma = app.get(PrismaService);
        const stamp = Date.now();
        const password = 'e2e-cascade-pass';
        const extraAdmin = await upsertE2eUser(prisma, {
          email: `e2ecasadmin${stamp}@gmail.com`,
          username: `e2ecasadmin${stamp}`,
          password,
          role: 'ADMIN',
        });
        const extraSession = await loginAs(app, extraAdmin.email, password);
        const extraToken = extraSession.token;

        const { genreId, instrumentId } = await catalogIds();
        const created = await request(app.getHttpServer())
          .post('/tabs')
          .set(authHeader(extraToken))
          .send({
            title: `e2e-extra-admin-tab-${stamp}`,
            artist: 'E2E Extra Admin',
            genreId,
            instrumentId,
            urlPdf: 'http://example.com/e2e.pdf',
            urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            urlImg: 'http://example.com/e2e.jpg',
          });
        expect(created.status).toBe(201);
        const extraTabId = created.body.id as number;

        const surviving = await request(app.getHttpServer())
          .post('/tabs')
          .set(authHeader(adminToken))
          .send({
            title: `e2e-survive-admin-del-${stamp}`,
            artist: 'E2E Survive',
            genreId,
            instrumentId,
            urlPdf: 'http://example.com/e2e.pdf',
            urlYoutube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            urlImg: 'http://example.com/e2e.jpg',
          });
        expect(surviving.status).toBe(201);
        const survivingTabId = surviving.body.id as number;

        await request(app.getHttpServer())
          .post(`/tabs/${extraTabId}/view`)
          .set(authHeader(extraToken))
          .expect(200);
        await request(app.getHttpServer())
          .post(`/tabs/${extraTabId}/view`)
          .set(authHeader(userToken))
          .expect(200);

        await prisma.copilotDailyUsage.upsert({
          where: { userId_date: { userId: extraAdmin.id, date: '2026-08-25' } },
          create: { userId: extraAdmin.id, date: '2026-08-25', count: 1 },
          update: { count: 1 },
        });

        const genreCountBefore = await prisma.genre.count();
        const instrumentCountBefore = await prisma.instrument.count();
        expect(await prisma.user.findUnique({ where: { id: userId } })).not.toBeNull();
        expect(await prisma.tab.count({ where: { userId: extraAdmin.id } })).toBeGreaterThan(0);
        expect(await prisma.tabView.count({ where: { tabId: extraTabId } })).toBeGreaterThan(0);

        await request(app.getHttpServer())
          .delete(`/users/${extraAdmin.id}`)
          .set(authHeader(adminToken))
          .expect(200);

        expect(await prisma.user.findUnique({ where: { id: extraAdmin.id } })).toBeNull();
        expect(await prisma.session.count({ where: { userId: extraAdmin.id } })).toBe(0);
        expect(await prisma.tabView.count({ where: { userId: extraAdmin.id } })).toBe(0);
        expect(await prisma.copilotDailyUsage.count({ where: { userId: extraAdmin.id } })).toBe(0);
        expect(await prisma.tab.findUnique({ where: { id: extraTabId } })).toBeNull();
        expect(await prisma.tabView.count({ where: { tabId: extraTabId } })).toBe(0);
        expect(await prisma.tab.findUnique({ where: { id: survivingTabId } })).not.toBeNull();
        expect(await prisma.user.findUnique({ where: { id: userId } })).not.toBeNull();
        expect(await prisma.genre.count()).toBe(genreCountBefore);
        expect(await prisma.instrument.count()).toBe(instrumentCountBefore);

        await request(app.getHttpServer())
          .delete(`/tabs/${survivingTabId}`)
          .set(authHeader(adminToken))
          .expect(200);
      });
    });
  });
});
