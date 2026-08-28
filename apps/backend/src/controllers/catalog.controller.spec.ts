import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@domain/entities/User';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../auth/auth.constants';
import { RolesGuard } from '../auth/roles.guard';
import { CatalogController } from './catalog.controller';

function mockContext(
  handler: (...args: unknown[]) => unknown,
  user?: { id: number; role: Role },
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => CatalogController,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('CatalogController authorization metadata', () => {
  const guard = new RolesGuard(new Reflector());

  it('GET /catalogs/genres is public', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, CatalogController.prototype.getGenres)).toBe(true);
  });

  it('GET /catalogs/instruments is public', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, CatalogController.prototype.getInstruments)).toBe(true);
  });

  it('POST /catalogs/genres requires ADMIN and forbids USER', () => {
    expect(Reflect.getMetadata(ROLES_KEY, CatalogController.prototype.create)).toEqual([Role.ADMIN]);
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, CatalogController.prototype.create)).toBeFalsy();
    expect(() =>
      guard.canActivate(mockContext(CatalogController.prototype.create, { id: 2, role: Role.USER })),
    ).toThrow(ForbiddenException);
    expect(
      guard.canActivate(mockContext(CatalogController.prototype.create, { id: 1, role: Role.ADMIN })),
    ).toBe(true);
  });

  it('PUT /catalogs/genres/:id requires ADMIN', () => {
    expect(Reflect.getMetadata(ROLES_KEY, CatalogController.prototype.update)).toEqual([Role.ADMIN]);
    expect(() =>
      guard.canActivate(mockContext(CatalogController.prototype.update, { id: 2, role: Role.USER })),
    ).toThrow(ForbiddenException);
  });

  it('DELETE /catalogs/genres/:id requires ADMIN', () => {
    expect(Reflect.getMetadata(ROLES_KEY, CatalogController.prototype.remove)).toEqual([Role.ADMIN]);
    expect(() =>
      guard.canActivate(mockContext(CatalogController.prototype.remove, { id: 2, role: Role.USER })),
    ).toThrow(ForbiddenException);
  });
});
