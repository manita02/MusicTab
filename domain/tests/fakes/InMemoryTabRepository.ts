import { Tab } from "../../src/entities/Tab";
import {
  ITabRepository,
  SearchTabsParams,
  ViewOrder,
  CountCatalogParams,
  UserViewStats,
} from "../../src/repositories/ITabRepository";
import { CopilotTabHit } from "../../src/dto/CopilotTabHit";

type StoredView = { userId: number; tabId: number; viewedAt: Date };

const DEFAULT_GENRES: Record<number, string> = {
  1: "Rock",
  2: "Jazz",
  3: "Pop",
  4: "Latin",
};

const DEFAULT_INSTRUMENTS: Record<number, string> = {
  1: "Guitar",
  2: "Piano",
  3: "Ukulele",
};

export class InMemoryTabRepository implements ITabRepository {
  private tabs: Tab[] = [];
  private views: StoredView[] = [];
  private idCounter = 1;
  readonly genres: Record<number, string>;
  readonly instruments: Record<number, string>;

  constructor(
    genres: Record<number, string> = DEFAULT_GENRES,
    instruments: Record<number, string> = DEFAULT_INSTRUMENTS
  ) {
    this.genres = { ...genres };
    this.instruments = { ...instruments };
  }

  async save(tab: Tab): Promise<Tab> {
    if (tab.id === null) {
      const newTab = Tab.rehydrate(
        this.idCounter++,
        tab.title,
        tab.userId,
        tab.genreId,
        tab.instrumentId,
        tab.urlPdf.getValue(),
        tab.urlYoutube.getValue(),
        tab.urlImg.getValue(),
        tab.createdAt,
        tab.userName,
        tab.artist,
        tab.viewCount,
        tab.userImg
      );
      this.tabs.push(newTab);
      return newTab;
    }
    const index = this.tabs.findIndex((t) => t.id === tab.id);
    if (index >= 0) this.tabs[index] = tab;
    else this.tabs.push(tab);
    return tab;
  }

  async findById(id: number): Promise<Tab | null> {
    return this.tabs.find((t) => t.id === id) ?? null;
  }

  async findByUser(userId: number): Promise<Tab[]> {
    return this.tabs.filter((t) => t.userId === userId);
  }

  async countByUserAndDate(userId: number, date: Date): Promise<number> {
    const day = date.toISOString().split("T")[0];
    return this.tabs.filter(
      (t) => t.userId === userId && t.createdAt.toISOString().split("T")[0] === day
    ).length;
  }

  async delete(id: number): Promise<void> {
    this.tabs = this.tabs.filter((t) => t.id !== id);
    this.views = this.views.filter((v) => v.tabId !== id);
  }

  async findByTitle(title: string): Promise<Tab | null> {
    return this.tabs.find((t) => t.title === title) ?? null;
  }

  async findLatest(limit: number): Promise<Tab[]> {
    return [...this.tabs]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async findAll(): Promise<Tab[]> {
    return [...this.tabs];
  }

  async update(tab: Tab): Promise<Tab> {
    await this.delete(tab.id!);
    await this.save(tab);
    const found = await this.findById(tab.id!);
    return found!;
  }

  async search(params: SearchTabsParams): Promise<CopilotTabHit[]> {
    if (params.genreName) {
      const genreId = this.resolveGenreId(params.genreName);
      if (genreId == null) return [];
    }
    if (params.instrumentName) {
      const instrumentId = this.resolveInstrumentId(params.instrumentName);
      if (instrumentId == null) return [];
    }

    let rows = this.tabs.map((t) => this.toHit(t));
    if (params.artist) {
      const q = params.artist.toLowerCase();
      rows = rows.filter((r) => r.artist.toLowerCase().includes(q));
    }
    if (params.genreName) {
      const q = params.genreName.toLowerCase();
      rows = rows.filter((r) => r.genre.toLowerCase() === q);
    }
    if (params.instrumentName) {
      const q = params.instrumentName.toLowerCase();
      rows = rows.filter((r) => r.instrument.toLowerCase() === q);
    }
    if (params.title) {
      const q = params.title.toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(q));
    }

    if (params.sort === "views") {
      rows.sort((a, b) => b.viewCount - a.viewCount || Date.parse(b.createdAt) - Date.parse(a.createdAt));
    } else {
      rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    }

    return rows.slice(0, params.take);
  }

  async countCatalog(params: CountCatalogParams): Promise<number> {
    let rows = this.tabs.map((t) => this.toHit(t));
    if (params.genreName) {
      if (this.resolveGenreId(params.genreName) == null) return 0;
      const q = params.genreName.toLowerCase();
      rows = rows.filter((r) => r.genre.toLowerCase() === q);
    }
    if (params.instrumentName) {
      if (this.resolveInstrumentId(params.instrumentName) == null) return 0;
      const q = params.instrumentName.toLowerCase();
      rows = rows.filter((r) => r.instrument.toLowerCase() === q);
    }
    if (params.artist?.trim()) {
      const q = params.artist.trim().toLowerCase();
      rows = rows.filter((r) => r.artist.toLowerCase().includes(q));
    }
    return rows.length;
  }

  async countByArtist(artist: string): Promise<number> {
    return this.countCatalog({ artist });
  }

  async listDistinctArtists(): Promise<string[]> {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const tab of this.tabs) {
      const name = tab.artist.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(name);
    }
    return names.sort((a, b) => a.localeCompare(b, "es"));
  }

  async findHitsByUserId(userId: number, take: number): Promise<CopilotTabHit[]> {
    return this.tabs
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, take)
      .map((t) => this.toHit(t));
  }

  async countByUserId(userId: number): Promise<number> {
    return this.tabs.filter((t) => t.userId === userId).length;
  }

  async findLastViewedByUser(userId: number): Promise<CopilotTabHit | null> {
    const mine = this.views
      .filter((v) => v.userId === userId)
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime());
    const last = mine[0];
    if (!last) return null;
    const tab = this.tabs.find((t) => t.id === last.tabId);
    return tab ? this.toHit(tab, last.viewedAt) : null;
  }

  async countViewsByUser(userId: number): Promise<UserViewStats> {
    const mine = this.views.filter((v) => v.userId === userId);
    return {
      events: mine.length,
      distinctTabs: new Set(mine.map((v) => v.tabId)).size,
    };
  }

  async findLatestViewAt(userId: number, tabId: number): Promise<Date | null> {
    const mine = this.views
      .filter((v) => v.userId === userId && v.tabId === tabId)
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime());
    return mine[0]?.viewedAt ?? null;
  }

  async recordView(userId: number, tabId: number): Promise<void> {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (!tab || tab.id == null) return;
    this.views.push({ userId, tabId, viewedAt: new Date() });
    const updated = Tab.rehydrate(
      tab.id,
      tab.title,
      tab.userId,
      tab.genreId,
      tab.instrumentId,
      tab.urlPdf.getValue(),
      tab.urlYoutube.getValue(),
      tab.urlImg.getValue(),
      tab.createdAt,
      tab.userName,
      tab.artist,
      tab.viewCount + 1,
      tab.userImg
    );
    const idx = this.tabs.findIndex((t) => t.id === tabId);
    this.tabs[idx] = updated;
  }

  async findTopViewedByUser(userId: number, order: ViewOrder, take: number): Promise<CopilotTabHit[]> {
    const counts = new Map<number, { count: number; lastViewedAt: Date }>();
    for (const v of this.views.filter((x) => x.userId === userId)) {
      const cur = counts.get(v.tabId);
      if (!cur) counts.set(v.tabId, { count: 1, lastViewedAt: v.viewedAt });
      else {
        cur.count += 1;
        if (v.viewedAt > cur.lastViewedAt) cur.lastViewedAt = v.viewedAt;
      }
    }
    if (counts.size === 0) return [];

    const ranked = [...counts.entries()].sort((a, b) => {
      const diff = order === "desc" ? b[1].count - a[1].count : a[1].count - b[1].count;
      if (diff !== 0) return diff;
      return order === "desc" ? b[0] - a[0] : a[0] - b[0];
    });

    return ranked.slice(0, take).flatMap(([tabId, meta]) => {
      const tab = this.tabs.find((t) => t.id === tabId);
      return tab ? [this.toHit(tab, meta.lastViewedAt)] : [];
    });
  }

  async findTopViewedGlobal(order: ViewOrder, take: number): Promise<CopilotTabHit[]> {
    const rows = this.tabs.map((t) => this.toHit(t));
    rows.sort((a, b) =>
      order === "desc"
        ? b.viewCount - a.viewCount || b.id - a.id
        : a.viewCount - b.viewCount || a.id - b.id
    );
    return rows.slice(0, take);
  }

  async findStaleViewedByUser(
    userId: number,
    staleAfterDays: number,
    take: number
  ): Promise<CopilotTabHit[]> {
    const lastByTab = new Map<number, Date>();
    for (const v of this.views.filter((x) => x.userId === userId)) {
      const cur = lastByTab.get(v.tabId);
      if (!cur || v.viewedAt > cur) lastByTab.set(v.tabId, v.viewedAt);
    }
    if (lastByTab.size === 0) return [];

    const cutoff = Date.now() - staleAfterDays * 24 * 60 * 60 * 1000;
    const entries = [...lastByTab.entries()];
    const stale = entries.filter(([, at]) => at.getTime() < cutoff);
    const chosen = (stale.length > 0 ? stale : entries).sort(
      (a, b) => a[1].getTime() - b[1].getTime()
    );

    return chosen.slice(0, take).flatMap(([tabId, lastViewedAt]) => {
      const tab = this.tabs.find((t) => t.id === tabId);
      return tab ? [this.toHit(tab, lastViewedAt)] : [];
    });
  }

  async findNeverViewedByUser(userId: number, take: number): Promise<CopilotTabHit[]> {
    const seen = new Set(this.views.filter((v) => v.userId === userId).map((v) => v.tabId));
    return this.tabs
      .filter((t) => t.id != null && !seen.has(t.id))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, take)
      .map((t) => this.toHit(t));
  }

  seedView(userId: number, tabId: number, viewedAt: Date): void {
    this.views.push({ userId, tabId, viewedAt });
  }

  private resolveGenreId(name: string): number | null {
    const q = name.toLowerCase();
    const found = Object.entries(this.genres).find(([, n]) => n.toLowerCase() === q);
    return found ? Number(found[0]) : null;
  }

  private resolveInstrumentId(name: string): number | null {
    const q = name.toLowerCase();
    const found = Object.entries(this.instruments).find(([, n]) => n.toLowerCase() === q);
    return found ? Number(found[0]) : null;
  }

  private toHit(tab: Tab, lastViewedAt?: Date): CopilotTabHit {
    const hit: CopilotTabHit = {
      id: tab.id!,
      title: tab.title,
      artist: tab.artist,
      genre: this.genres[tab.genreId] ?? "",
      instrument: this.instruments[tab.instrumentId] ?? "",
      viewCount: tab.viewCount,
      createdAt: tab.createdAt.toISOString(),
    };
    if (lastViewedAt) hit.lastViewedAt = lastViewedAt.toISOString();
    return hit;
  }
}
