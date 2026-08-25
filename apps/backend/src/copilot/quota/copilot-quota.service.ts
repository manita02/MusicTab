import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { COPILOT } from '../copilot.constants';
import { copilotCooldown, copilotDailyLimit } from '../copilot.exceptions';
import { calendarDateInArgentina, nextResetAtIso } from './argentina-calendar';
import { cooldownUntilFrom, remainingMs } from './copilot-cooldown';

export type CopilotQuotaSnapshot = {
  used: number;
  limit: number;
  remaining: number;
  cooldownUntil: string | null;
  cooldownRemainingMs: number;
};

export type CopilotQuotaResponse = CopilotQuotaSnapshot & {
  resetAt: string;
};

@Injectable()
export class CopilotQuotaService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuota(userId: number, now = new Date()): Promise<CopilotQuotaResponse> {
    const date = calendarDateInArgentina(now);
    const [row, user] = await Promise.all([
      this.prisma.copilotDailyUsage.findUnique({
        where: { userId_date: { userId, date } },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { lastCopilotMessageAt: true },
      }),
    ]);
    return {
      ...this.toSnapshot(row?.count ?? 0, user?.lastCopilotMessageAt ?? null, now),
      resetAt: nextResetAtIso(now),
    };
  }

  async assertCanConsume(userId: number, now = new Date()): Promise<void> {
    const snapshot = await this.getQuota(userId, now);
    if (snapshot.cooldownRemainingMs > 0) {
      throw copilotCooldown(snapshot.cooldownRemainingMs);
    }
    if (snapshot.used >= COPILOT.DAILY_MESSAGE_LIMIT) {
      throw copilotDailyLimit();
    }
  }

  async increment(userId: number, now = new Date()): Promise<CopilotQuotaSnapshot> {
    const date = calendarDateInArgentina(now);
    const [row] = await this.prisma.$transaction([
      this.prisma.copilotDailyUsage.upsert({
        where: { userId_date: { userId, date } },
        create: { userId, date, count: 1 },
        update: { count: { increment: 1 } },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { lastCopilotMessageAt: now },
      }),
    ]);
    return this.toSnapshot(row.count, now, now);
  }

  private toSnapshot(
    used: number,
    lastCopilotMessageAt: Date | null,
    now: Date,
  ): CopilotQuotaSnapshot {
    const until = cooldownUntilFrom(lastCopilotMessageAt, now, COPILOT.SEND_COOLDOWN_MS);
    return {
      used,
      limit: COPILOT.DAILY_MESSAGE_LIMIT,
      remaining: Math.max(0, COPILOT.DAILY_MESSAGE_LIMIT - used),
      cooldownUntil: until ? until.toISOString() : null,
      cooldownRemainingMs: remainingMs(until, now),
    };
  }
}
