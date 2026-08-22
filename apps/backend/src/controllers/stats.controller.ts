import { Controller, Get, Query } from '@nestjs/common';
import { CopilotTabHit } from '@domain/dto/CopilotTabHit';
import { GetStatsGlobal } from '@domain/use-cases/GetStatsGlobal';
import { GetStatsMe } from '@domain/use-cases/GetStatsMe';
import { STATS_RESULT_LIMIT } from '@domain/stats.constants';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { TabPrismaRepository } from '../repositories/tab-prisma.repository';

function serializeHit(hit: CopilotTabHit) {
  return {
    id: hit.id,
    title: hit.title,
    artist: hit.artist,
    genre: hit.genre,
    instrument: hit.instrument,
    viewCount: hit.viewCount,
    createdAt: hit.createdAt,
    ...(hit.lastViewedAt ? { lastViewedAt: hit.lastViewedAt } : {}),
    ...(hit.userViewCount != null ? { userViewCount: hit.userViewCount } : {}),
  };
}

@Controller('stats')
export class StatsController {
  private readonly getStatsGlobal: GetStatsGlobal;
  private readonly getStatsMe: GetStatsMe;

  constructor(private readonly tabRepo: TabPrismaRepository) {
    this.getStatsGlobal = new GetStatsGlobal(this.tabRepo);
    this.getStatsMe = new GetStatsMe(this.tabRepo);
  }

  @Public()
  @Get('global')
  async global(@Query('take') rawTake?: string) {
    const parsed = Number(rawTake);
    const take = Number.isFinite(parsed) ? parsed : STATS_RESULT_LIMIT;
    const data = await this.getStatsGlobal.execute(take);
    return {
      most: data.most.map(serializeHit),
      least: data.least.map(serializeHit),
    };
  }

  @Get('me')
  async me(@CurrentUser() user: RequestUser) {
    const data = await this.getStatsMe.execute(user.id);
    return {
      kpis: data.kpis,
      lastViewed: data.lastViewed ? serializeHit(data.lastViewed) : null,
      most: data.most.map(serializeHit),
      least: data.least.map(serializeHit),
      never: data.never.map(serializeHit),
      stale: data.stale.map(serializeHit),
    };
  }
}
