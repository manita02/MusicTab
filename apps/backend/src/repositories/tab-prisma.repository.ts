import { Injectable } from '@nestjs/common';
import { ITabRepository, SearchTabsParams, ViewOrder, CountCatalogParams, UserViewStats } from '@domain/repositories/ITabRepository';
import { Tab } from '@domain/entities/Tab';
import { CopilotTabHit } from '@domain/dto/CopilotTabHit';
import { PrismaService } from '../prisma/prisma.service';

/** Fila prisma.Tab sin relaciones */
type DbTabRow = {
  id: number;
  title: string;
  artist: string;
  urlPdf: string;
  urlYoutube: string | null;
  urlImagen: string | null;
  userId: number;
  genreId: number;
  instrumentId: number;
  createdAt: Date;
  viewCount: number;
};

/** Tab + usuario (include user en findLatest / findAll) */
type TabRowWithUser = DbTabRow & { user: { username: string } };

type TabRowWithCatalog = DbTabRow & {
  genre: { name: string };
  instrument: { name: string };
};

const COPILOT_TAKE_CAP = 3;

@Injectable()
export class TabPrismaRepository implements ITabRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(tab: Tab): Promise<Tab> {
    const record = await this.prisma.tab.create({
      data: {
        title: tab.title,
        artist: tab.artist,
        urlPdf: tab.urlPdf.toString(),
        urlYoutube: tab.urlYoutube.toString(),
        urlImagen: tab.urlImg.toString(),
        userId: tab.userId,
        genreId: tab.genreId,
        instrumentId: tab.instrumentId,
      },
    });

    return this.toTab(record);
  }

  async findById(id: number): Promise<Tab | null> {
    const record = await this.prisma.tab.findUnique({ where: { id } });
    if (!record) return null;
    return this.toTab(record);
  }

  async findByUser(userId: number): Promise<Tab[]> {
    const records = await this.prisma.tab.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: DbTabRow) => this.toTab(r));
  }

  async countByUserAndDate(userId: number, date: Date): Promise<number> {
    if (!this.prisma || !this.prisma.tab) {
      console.error('Prisma o prisma.tab es undefined!', this.prisma);
      throw new Error('Prisma o prisma.tab no está definido');
    }
  
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
  
    const count = await this.prisma.tab.count({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    return count;
  }
  

  async delete(id: number): Promise<void> {
    await this.prisma.tab.delete({ where: { id } });
  }

  async findByTitle(title: string): Promise<Tab | null> {
    const record = await this.prisma.tab.findUnique({ where: { title } });
    if (!record) return null;
    return this.toTab(record);
  }

  async findLatest(limit: number): Promise<Tab[]> {
    const records = await this.prisma.tab.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return records.map((r: TabRowWithUser) => this.toTab(r, r.user.username));
  }

  async findAll(): Promise<Tab[]> {
    const result = await this.prisma.tab.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return result.map((t: TabRowWithUser) => this.toTab(t, t.user.username));
  }

  /** Full authenticated view (URLs included), one row */
  async findAuthorizedRow(id: number): Promise<{
    id: number;
    title: string;
    artist: string;
    userId: number;
    genreId: number;
    instrumentId: number;
    urlPdf: string;
    urlYoutube: string;
    urlImg: string;
    createdAt: Date;
    userName: string;
    viewCount: number;
  } | null> {
    const r = await this.prisma.tab.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!r) return null;
    return {
      id: r.id,
      title: r.title,
      artist: r.artist ?? '',
      userId: r.userId,
      genreId: r.genreId,
      instrumentId: r.instrumentId,
      urlPdf: r.urlPdf,
      urlYoutube: r.urlYoutube ?? '',
      urlImg: r.urlImagen ?? '',
      createdAt: r.createdAt,
      userName: r.user.username,
      viewCount: r.viewCount ?? 0,
    };
  }

  async update(tab: Tab): Promise<Tab> {
    if (!tab.id) {
      throw new Error("Cannot update a tab without an ID");
    }

    const record = await this.prisma.tab.update({
      where: { id: tab.id },
      data: {
        title: tab.title,
        artist: tab.artist,
        urlPdf: tab.urlPdf.toString(),
        urlYoutube: tab.urlYoutube.toString(),
        urlImagen: tab.urlImg.toString(),
        genreId: tab.genreId,
        instrumentId: tab.instrumentId,
      },
    });

    return this.toTab(record);
  }

  async search(params: SearchTabsParams): Promise<CopilotTabHit[]> {
    const take = Math.min(Math.max(params.take, 1), COPILOT_TAKE_CAP);
    const where = await this.buildCatalogWhere(params);
    if (where === null) return [];

    if (params.artist?.trim()) {
      (where as { artist?: { contains: string } }).artist = { contains: params.artist.trim() };
    }

    const records = await this.prisma.tab.findMany({
      where,
      orderBy:
        params.sort === 'views'
          ? [{ viewCount: 'desc' }, { createdAt: 'desc' }]
          : [{ createdAt: 'desc' }],
      include: { genre: true, instrument: true },
    });

    let hits = records.map((r: TabRowWithCatalog) => this.toHit(r));
    if (params.title) {
      const q = params.title.trim().toLowerCase();
      hits = hits.filter((h) => h.title.toLowerCase().includes(q));
    }
    return hits.slice(0, take);
  }

  async countCatalog(params: CountCatalogParams): Promise<number> {
    const where = await this.buildCatalogWhere(params);
    if (where === null) return 0;

    if (params.artist?.trim()) {
      const q = params.artist.trim().toLowerCase();
      const rows = await this.prisma.tab.findMany({
        where,
        select: { artist: true },
      });
      return rows.filter((row: { artist: string }) => row.artist.toLowerCase().includes(q)).length;
    }

    return this.prisma.tab.count({ where });
  }

  async countByArtist(artist: string): Promise<number> {
    return this.countCatalog({ artist });
  }

  async listDistinctArtists(): Promise<string[]> {
    const rows = await this.prisma.tab.findMany({ select: { artist: true } });
    const seen = new Set<string>();
    const names: string[] = [];
    for (const row of rows) {
      const name = String(row.artist ?? '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(name);
    }
    return names.sort((a, b) => a.localeCompare(b, 'es'));
  }

  async findHitsByUserId(userId: number, take: number): Promise<CopilotTabHit[]> {
    const capped = Math.min(Math.max(take, 1), COPILOT_TAKE_CAP);
    const records = await this.prisma.tab.findMany({
      where: { userId },
      take: capped,
      orderBy: { createdAt: 'desc' },
      include: { genre: true, instrument: true },
    });
    return records.map((r: TabRowWithCatalog) => this.toHit(r));
  }

  async countByUserId(userId: number): Promise<number> {
    return this.prisma.tab.count({ where: { userId } });
  }

  async findLastViewedByUser(userId: number): Promise<CopilotTabHit | null> {
    const last = await this.prisma.tabView.findFirst({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
    });
    if (!last) return null;
    const hits = await this.loadHitsByIds([last.tabId], { [last.tabId]: last.viewedAt });
    return hits[0] ?? null;
  }

  async countViewsByUser(userId: number): Promise<UserViewStats> {
    const events = await this.prisma.tabView.count({ where: { userId } });
    const grouped = await this.prisma.tabView.groupBy({
      by: ['tabId'],
      where: { userId },
    });
    return { events, distinctTabs: grouped.length };
  }

  private async buildCatalogWhere(params: {
    artist?: string;
    genreName?: string;
    instrumentName?: string;
  }): Promise<Record<string, unknown> | null> {
    const where: {
      artist?: { contains: string };
      genreId?: number;
      instrumentId?: number;
    } = {};

    if (params.genreName) {
      const genreId = await this.resolveGenreIdByName(params.genreName);
      if (genreId == null) return null;
      where.genreId = genreId;
    }

    if (params.instrumentName) {
      const instrumentId = await this.resolveInstrumentIdByName(params.instrumentName);
      if (instrumentId == null) return null;
      where.instrumentId = instrumentId;
    }

    return where;
  }

  async findLatestViewAt(userId: number, tabId: number): Promise<Date | null> {
    const last = await this.prisma.tabView.findFirst({
      where: { userId, tabId },
      orderBy: { viewedAt: 'desc' },
    });
    return last?.viewedAt ?? null;
  }

  async recordView(userId: number, tabId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.tabView.create({
        data: { userId, tabId },
      }),
      this.prisma.tab.update({
        where: { id: tabId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);
  }

  async findTopViewedByUser(userId: number, order: ViewOrder, take: number): Promise<CopilotTabHit[]> {
    const capped = Math.min(Math.max(take, 1), COPILOT_TAKE_CAP);
    const grouped = await this.prisma.tabView.groupBy({
      by: ['tabId'],
      where: { userId },
      _count: { id: true },
      _max: { viewedAt: true },
    });
    if (grouped.length === 0) return [];

    grouped.sort((a, b) => {
      const diff =
        order === 'desc' ? b._count.id - a._count.id : a._count.id - b._count.id;
      if (diff !== 0) return diff;
      return order === 'desc' ? b.tabId - a.tabId : a.tabId - b.tabId;
    });

    const selected = grouped.slice(0, capped);
    return this.loadHitsByIds(
      selected.map((g) => g.tabId),
      Object.fromEntries(selected.map((g) => [g.tabId, g._max.viewedAt ?? undefined])),
    );
  }

  async findTopViewedGlobal(order: ViewOrder, take: number): Promise<CopilotTabHit[]> {
    const capped = Math.min(Math.max(take, 1), COPILOT_TAKE_CAP);
    const records = await this.prisma.tab.findMany({
      take: capped,
      orderBy:
        order === 'desc'
          ? [{ viewCount: 'desc' }, { id: 'desc' }]
          : [{ viewCount: 'asc' }, { id: 'asc' }],
      include: { genre: true, instrument: true },
    });
    return records.map((r: TabRowWithCatalog) => this.toHit(r));
  }

  async findStaleViewedByUser(
    userId: number,
    staleAfterDays: number,
    take: number,
  ): Promise<CopilotTabHit[]> {
    const capped = Math.min(Math.max(take, 1), COPILOT_TAKE_CAP);
    const grouped = await this.prisma.tabView.groupBy({
      by: ['tabId'],
      where: { userId },
      _max: { viewedAt: true },
    });
    if (grouped.length === 0) return [];

    const cutoff = new Date(Date.now() - staleAfterDays * 24 * 60 * 60 * 1000);
    const stale = grouped.filter((g) => g._max.viewedAt && g._max.viewedAt < cutoff);
    const pool = stale.length > 0 ? stale : grouped;
    pool.sort((a, b) => {
      const aTime = a._max.viewedAt?.getTime() ?? 0;
      const bTime = b._max.viewedAt?.getTime() ?? 0;
      return aTime - bTime;
    });

    const selected = pool.slice(0, capped);
    return this.loadHitsByIds(
      selected.map((g) => g.tabId),
      Object.fromEntries(selected.map((g) => [g.tabId, g._max.viewedAt ?? undefined])),
    );
  }

  async findNeverViewedByUser(userId: number, take: number): Promise<CopilotTabHit[]> {
    const capped = Math.min(Math.max(take, 1), COPILOT_TAKE_CAP);
    const records = await this.prisma.tab.findMany({
      where: {
        views: { none: { userId } },
      },
      take: capped,
      orderBy: { createdAt: 'desc' },
      include: { genre: true, instrument: true },
    });
    return records.map((r: TabRowWithCatalog) => this.toHit(r));
  }

  private async resolveGenreIdByName(name: string): Promise<number | null> {
    const genres = await this.prisma.genre.findMany();
    const found = genres.find((g) => g.name.toLowerCase() === name.trim().toLowerCase());
    return found?.id ?? null;
  }

  private async resolveInstrumentIdByName(name: string): Promise<number | null> {
    const instruments = await this.prisma.instrument.findMany();
    const found = instruments.find((i) => i.name.toLowerCase() === name.trim().toLowerCase());
    return found?.id ?? null;
  }

  private async loadHitsByIds(
    ids: number[],
    lastViewedAtById: Record<number, Date | undefined>,
  ): Promise<CopilotTabHit[]> {
    if (ids.length === 0) return [];
    const records = await this.prisma.tab.findMany({
      where: { id: { in: ids } },
      include: { genre: true, instrument: true },
    });
    const byId = new Map(records.map((r: TabRowWithCatalog) => [r.id, r]));
    return ids.flatMap((id) => {
      const row = byId.get(id);
      return row ? [this.toHit(row, lastViewedAtById[id])] : [];
    });
  }

  private toTab(r: DbTabRow, userName?: string): Tab {
    return Tab.rehydrate(
      r.id,
      r.title,
      r.userId,
      r.genreId,
      r.instrumentId,
      r.urlPdf,
      r.urlYoutube!,
      r.urlImagen!,
      r.createdAt,
      userName,
      r.artist ?? '',
      r.viewCount ?? 0,
    );
  }

  private toHit(r: TabRowWithCatalog, lastViewedAt?: Date): CopilotTabHit {
    const hit: CopilotTabHit = {
      id: r.id,
      title: r.title,
      artist: r.artist ?? '',
      genre: r.genre.name,
      instrument: r.instrument.name,
      viewCount: r.viewCount ?? 0,
      createdAt: r.createdAt.toISOString(),
    };
    if (lastViewedAt) hit.lastViewedAt = lastViewedAt.toISOString();
    return hit;
  }
}
