import { describe, expect, it, vi } from 'vitest';
import { BackupSqlService } from './backup-sql.service';
import { PrismaService } from '../prisma/prisma.service';

function emptyFindMany() {
  return {
    user: { findMany: vi.fn().mockResolvedValue([]) },
    genre: { findMany: vi.fn().mockResolvedValue([]) },
    instrument: { findMany: vi.fn().mockResolvedValue([]) },
    tab: { findMany: vi.fn().mockResolvedValue([]) },
    tabView: { findMany: vi.fn().mockResolvedValue([]) },
    copilotDailyUsage: { findMany: vi.fn().mockResolvedValue([]) },
    session: { findMany: vi.fn() },
  };
}

describe('BackupSqlService', () => {
  it('reads dump tables in FK order and never queries Session', async () => {
    const prisma = emptyFindMany();
    const service = new BackupSqlService(prisma as unknown as PrismaService);
    const now = new Date('2026-08-27T21:12:00.000Z');

    const result = await service.generate(now);

    expect(prisma.user.findMany).toHaveBeenCalledWith({ orderBy: { id: 'asc' } });
    expect(prisma.genre.findMany).toHaveBeenCalled();
    expect(prisma.instrument.findMany).toHaveBeenCalled();
    expect(prisma.tab.findMany).toHaveBeenCalled();
    expect(prisma.tabView.findMany).toHaveBeenCalled();
    expect(prisma.copilotDailyUsage.findMany).toHaveBeenCalled();
    expect(prisma.session.findMany).not.toHaveBeenCalled();

    expect(result.filename).toBe('musictab-backup-2026-08-27T211200Z.sql');
    expect(result.sql).toContain('TRUNCATE TABLE');
    expect(result.sql).not.toMatch(/INSERT INTO "Session"/);
    expect(result.sql).toContain('-- 0 rows');
  });

  it('includes current rows with explicit ids', async () => {
    const prisma = emptyFindMany();
    prisma.user.findMany.mockResolvedValue([
      {
        id: 1,
        username: 'root',
        email: 'admin@gmail.com',
        passwordHash: '$2a$10$hash',
        role: 'ADMIN',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        birthDate: new Date('1990-01-01T00:00:00.000Z'),
        urlImg: 'https://img.example/a.png',
        signupIp: null,
        lastCopilotMessageAt: null,
      },
    ]);
    prisma.instrument.findMany.mockResolvedValue([{ id: 3, name: 'Piano', urlIco: '' }]);

    const service = new BackupSqlService(prisma as unknown as PrismaService);
    const { sql } = await service.generate(new Date('2026-08-27T21:12:00.000Z'));

    expect(sql).toContain('(1,');
    expect(sql).toContain("'$2a$10$hash'");
    expect(sql).toContain('INSERT INTO "Instrument" ("id","name","urlIco") VALUES');
    expect(sql).toContain("(3, 'Piano', '')");
  });
});
