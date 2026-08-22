import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { authHeader, createE2eApp, seedE2eActors } from './e2e-app';

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
  });
});
