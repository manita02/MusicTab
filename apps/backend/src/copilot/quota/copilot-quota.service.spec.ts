import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { CopilotQuotaService } from './copilot-quota.service';

describe('CopilotQuotaService', () => {
  const prisma = {
    copilotDailyUsage: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  const service = new CopilotQuotaService(prisma as unknown as PrismaService);

  beforeEach(() => {
    prisma.copilotDailyUsage.findUnique.mockReset();
    prisma.copilotDailyUsage.upsert.mockReset();
    prisma.user.findUnique.mockReset();
    prisma.user.update.mockReset();
    prisma.$transaction.mockReset();
    prisma.$transaction.mockImplementation((ops: Array<Promise<unknown>>) => Promise.all(ops));
  });

  it('getQuota sin lastCopilotMessageAt deja cooldownRemainingMs en 0', async () => {
    const now = new Date('2026-08-22T12:00:00.000Z');
    prisma.copilotDailyUsage.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({ lastCopilotMessageAt: null });

    const snapshot = await service.getQuota(1, now);

    expect(snapshot.used).toBe(0);
    expect(snapshot.limit).toBe(10);
    expect(snapshot.remaining).toBe(10);
    expect(snapshot.cooldownUntil).toBeNull();
    expect(snapshot.cooldownRemainingMs).toBe(0);
  });

  it('getQuota con last hace 20s deja ~40000ms y cooldownUntil = last+60s', async () => {
    const now = new Date('2026-08-22T12:00:00.000Z');
    const last = new Date(now.getTime() - 20_000);
    prisma.copilotDailyUsage.findUnique.mockResolvedValue({ count: 1 });
    prisma.user.findUnique.mockResolvedValue({ lastCopilotMessageAt: last });

    const snapshot = await service.getQuota(3, now);

    expect(snapshot.used).toBe(1);
    expect(snapshot.remaining).toBe(9);
    expect(snapshot.cooldownRemainingMs).toBe(40_000);
    expect(snapshot.cooldownUntil).toBe(new Date(last.getTime() + 60_000).toISOString());
  });

  it('getQuota con last hace 61s deja remaining 0', async () => {
    const now = new Date('2026-08-22T12:00:00.000Z');
    const last = new Date(now.getTime() - 61_000);
    prisma.copilotDailyUsage.findUnique.mockResolvedValue({ count: 2 });
    prisma.user.findUnique.mockResolvedValue({ lastCopilotMessageAt: last });

    const snapshot = await service.getQuota(3, now);

    expect(snapshot.cooldownRemainingMs).toBe(0);
    expect(snapshot.cooldownUntil).toBeNull();
  });

  it('assertCanConsume en cooldown lanza COPILOT_COOLDOWN', async () => {
    const now = new Date('2026-08-22T12:00:00.000Z');
    prisma.copilotDailyUsage.findUnique.mockResolvedValue({ count: 1 });
    prisma.user.findUnique.mockResolvedValue({
      lastCopilotMessageAt: new Date(now.getTime() - 10_000),
    });

    await expect(service.assertCanConsume(4, now)).rejects.toMatchObject({
      copilotCode: 'COPILOT_COOLDOWN',
    });
    expect(prisma.copilotDailyUsage.upsert).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('assertCanConsume con used>=10 y cooldown vencido lanza COPILOT_DAILY_LIMIT', async () => {
    const now = new Date('2026-08-22T12:00:00.000Z');
    prisma.copilotDailyUsage.findUnique.mockResolvedValue({ count: 10 });
    prisma.user.findUnique.mockResolvedValue({
      lastCopilotMessageAt: new Date(now.getTime() - 61_000),
    });

    await expect(service.assertCanConsume(4, now)).rejects.toMatchObject({
      copilotCode: 'COPILOT_DAILY_LIMIT',
    });
  });

  it('increment setea lastCopilotMessageAt y count+1', async () => {
    const now = new Date('2026-08-22T12:00:00.000Z');
    prisma.copilotDailyUsage.upsert.mockResolvedValue({ count: 2 });
    prisma.user.update.mockResolvedValue({ id: 7, lastCopilotMessageAt: now });

    const snapshot = await service.increment(7, now);

    expect(prisma.copilotDailyUsage.upsert).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: { lastCopilotMessageAt: now },
    });
    expect(snapshot).toEqual({
      used: 2,
      remaining: 8,
      limit: 10,
      cooldownUntil: new Date(now.getTime() + 60_000).toISOString(),
      cooldownRemainingMs: 60_000,
    });
  });

  it('cruzar medianoche AR: last de ayer hace 20s todavía bloquea', async () => {
    const now = new Date('2026-08-22T03:00:10.000Z');
    const last = new Date('2026-08-22T02:59:50.000Z');
    prisma.copilotDailyUsage.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({ lastCopilotMessageAt: last });

    const snapshot = await service.getQuota(9, now);

    expect(snapshot.used).toBe(0);
    expect(snapshot.cooldownRemainingMs).toBe(40_000);
    await expect(service.assertCanConsume(9, now)).rejects.toMatchObject({
      copilotCode: 'COPILOT_COOLDOWN',
    });
  });
});
