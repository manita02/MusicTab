import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DomainErrorFilter } from '../src/filters/conflict-error.filter';
import { PrismaService } from '../src/prisma/prisma.service';

const E2E_USER_EMAIL = 'e2e.regular@gmail.com';
const E2E_USER_NAME = 'e2eregular';
const E2E_USER_PASSWORD = 'e2e-user-pass';
const E2E_ADMIN_EMAIL = 'e2e.admin@gmail.com';
const E2E_ADMIN_NAME = 'e2eadmin';
const E2E_ADMIN_PASSWORD = 'e2e-admin-pass';
export const E2E_ADMIN2_EMAIL = 'e2e.admin2@gmail.com';
export const E2E_ADMIN2_NAME = 'e2eadmin2';
export const E2E_ADMIN2_PASSWORD = 'e2e-admin2-pass';

export async function createE2eApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalFilters(new DomainErrorFilter());
  await app.init();
  return app;
}

export async function upsertE2eUser(
  prisma: PrismaService,
  data: { email: string; username: string; password: string; role: 'USER' | 'ADMIN' },
) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const byEmail = await prisma.user.findUnique({ where: { email: data.email } });
  const byName = await prisma.user.findUnique({ where: { username: data.username } });
  const existing = byEmail ?? byName;
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, role: data.role, email: data.email, username: data.username },
    });
  }
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash,
      role: data.role,
      birthDate: new Date('1995-01-01'),
      urlImg: 'https://example.com/e2e.png',
      signupIp: '203.0.113.10',
    },
  });
}

export async function loginAs(
  app: INestApplication<App>,
  email: string,
  password: string,
): Promise<{ token: string; userId: number }> {
  const res = await request(app.getHttpServer())
    .post('/users/login')
    .send({ email, password, expiresInSeconds: 3600 });
  if (!res.body?.token) {
    throw new Error(`e2e login failed (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.token as string, userId: res.body.userId as number };
}

export async function seedE2eActors(app: INestApplication<App>) {
  const prisma = app.get(PrismaService);
  const user = await upsertE2eUser(prisma, {
    email: E2E_USER_EMAIL,
    username: E2E_USER_NAME,
    password: E2E_USER_PASSWORD,
    role: 'USER',
  });
  const admin = await upsertE2eUser(prisma, {
    email: E2E_ADMIN_EMAIL,
    username: E2E_ADMIN_NAME,
    password: E2E_ADMIN_PASSWORD,
    role: 'ADMIN',
  });
  const userSession = await loginAs(app, E2E_USER_EMAIL, E2E_USER_PASSWORD);
  const adminSession = await loginAs(app, E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD);
  return {
    user: { ...userSession, id: user.id },
    admin: { ...adminSession, id: admin.id },
  };
}

export async function seedE2eSecondAdmin(app: INestApplication<App>) {
  const prisma = app.get(PrismaService);
  const admin = await upsertE2eUser(prisma, {
    email: E2E_ADMIN2_EMAIL,
    username: E2E_ADMIN2_NAME,
    password: E2E_ADMIN2_PASSWORD,
    role: 'ADMIN',
  });
  const session = await loginAs(app, E2E_ADMIN2_EMAIL, E2E_ADMIN2_PASSWORD);
  return { ...session, id: admin.id };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
