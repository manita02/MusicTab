import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@domain/entities/User';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../auth/auth.constants';
import { RolesGuard } from '../auth/roles.guard';
import { TabController } from './tab.controller';

function mockContext(
  handler: (...args: unknown[]) => unknown,
  user?: { id: number; role: Role },
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => TabController,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('TabController authorization metadata', () => {
  const guard = new RolesGuard(new Reflector());

  it('GET /tabs is not public', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, TabController.prototype.listAuthenticated)).toBeFalsy();
  });

  it('POST /tabs requires ADMIN and forbids USER', () => {
    expect(Reflect.getMetadata(ROLES_KEY, TabController.prototype.create)).toEqual([Role.ADMIN]);
    expect(() =>
      guard.canActivate(mockContext(TabController.prototype.create, { id: 2, role: Role.USER })),
    ).toThrow(ForbiddenException);
    expect(guard.canActivate(mockContext(TabController.prototype.create, { id: 1, role: Role.ADMIN }))).toBe(
      true,
    );
  });

  it('PUT /tabs/:id requires ADMIN and forbids USER', () => {
    expect(Reflect.getMetadata(ROLES_KEY, TabController.prototype.updateAuthenticated)).toEqual([
      Role.ADMIN,
    ]);
    expect(() =>
      guard.canActivate(
        mockContext(TabController.prototype.updateAuthenticated, { id: 2, role: Role.USER }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('DELETE /tabs/:id requires ADMIN and forbids USER', () => {
    expect(Reflect.getMetadata(ROLES_KEY, TabController.prototype.deleteAuthenticated)).toEqual([
      Role.ADMIN,
    ]);
    expect(() =>
      guard.canActivate(
        mockContext(TabController.prototype.deleteAuthenticated, { id: 2, role: Role.USER }),
      ),
    ).toThrow(ForbiddenException);
  });
});
