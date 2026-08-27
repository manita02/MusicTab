import 'reflect-metadata';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';
import { Role } from '@domain/entities/User';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../auth/auth.constants';
import { RolesGuard } from '../auth/roles.guard';
import { BackupController } from './backup.controller';

function mockContext(user?: { id: number; role: Role }): ExecutionContext {
  return {
    getHandler: () => BackupController.prototype.download,
    getClass: () => BackupController,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('GET /admin/backup.sql authorization', () => {
  const guard = new RolesGuard(new Reflector());

  it('is not public, so a missing JWT is rejected by JwtAuthGuard (401)', () => {
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, BackupController.prototype.download);
    expect(isPublic).toBeFalsy();
  });

  it('requires ADMIN', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, BackupController.prototype.download);
    expect(roles).toEqual([Role.ADMIN]);
  });

  it('forbids a USER (403)', () => {
    expect(() => guard.canActivate(mockContext({ id: 2, role: Role.USER }))).toThrow(
      ForbiddenException,
    );
  });

  it('allows an ADMIN', () => {
    expect(guard.canActivate(mockContext({ id: 1, role: Role.ADMIN }))).toBe(true);
  });
});
