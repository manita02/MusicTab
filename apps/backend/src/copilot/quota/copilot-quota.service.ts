import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { COPILOT } from '../copilot.constants';
import { copilotDailyLimit } from '../copilot.exceptions';
import { calendarDateInArgentina, nextResetAtIso } from './argentina-calendar';

export type CopilotQuotaSnapshot = {
  used: number;
  limit: number;
  remaining: number;
};

export type CopilotQuotaResponse = CopilotQuotaSnapshot & {
  resetAt: string;
};

@Injectable()
export class CopilotQuotaService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuota(userId: number, now = new Date()): Promise<CopilotQuotaResponse> {
    const used = await this.currentCount(userId, now);
    return {
      ...this.toSnapshot(used),
      resetAt: nextResetAtIso(now),
    };
  }

  async assertCanConsume(userId: number, now = new Date()): Promise<void> {
    const used = await this.currentCount(userId, now);
    if (used >= COPILOT.DAILY_MESSAGE_LIMIT) {
      throw copilotDailyLimit();
    }
  }

  async increment(userId: number, now = new Date()): Promise<CopilotQuotaSnapshot> {
    const date = calendarDateInArgentina(now);
    const row = await this.prisma.copilotDailyUsage.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, count: 1 },
      update: { count: { increment: 1 } },
    });
    return this.toSnapshot(row.count);
  }

  private async currentCount(userId: number, now: Date): Promise<number> {
    const date = calendarDateInArgentina(now);
    const row = await this.prisma.copilotDailyUsage.findUnique({
      where: { userId_date: { userId, date } },
    });
    return row?.count ?? 0;
  }

  private toSnapshot(used: number): CopilotQuotaSnapshot {
    return {
      used,
      limit: COPILOT.DAILY_MESSAGE_LIMIT,
      remaining: Math.max(0, COPILOT.DAILY_MESSAGE_LIMIT - used),
    };
  }
}
