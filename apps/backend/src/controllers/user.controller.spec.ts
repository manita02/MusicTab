import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@domain/entities/User';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../auth/auth.constants';
import { RolesGuard } from '../auth/roles.guard';
import { UserController } from './user.controller';

function mockContext(user?: { id: number; role: Role }): ExecutionContext {
  return {
    getHandler: () => UserController.prototype.list,
    getClass: () => UserController,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('GET /users authorization', () => {
  const guard = new RolesGuard(new Reflector());

  it('is not public, so a missing JWT is rejected by JwtAuthGuard (401)', () => {
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, UserController.prototype.list);
    expect(isPublic).toBeFalsy();
  });

  it('requires ADMIN', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, UserController.prototype.list);
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
