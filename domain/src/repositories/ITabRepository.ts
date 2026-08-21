import { Tab } from "../entities/Tab";
import { CopilotTabHit } from "../dto/CopilotTabHit";

export type TabSearchSort = "recent" | "views";
export type ViewOrder = "desc" | "asc";

export type SearchTabsParams = {
  artist?: string;
  genreName?: string;
  instrumentName?: string;
  sort: TabSearchSort;
  take: number;
};

export interface ITabRepository {
  save(tab: Tab): Promise<Tab>;
  update(tab: Tab): Promise<Tab>;
  findById(id: number): Promise<Tab | null>;
  findByUser(userId: number): Promise<Tab[]>;
  countByUserAndDate(userId: number, date: Date): Promise<number>;
  delete(id: number): Promise<void>;
  findByTitle(title: string): Promise<Tab | null>;
  findLatest(limit: number): Promise<Tab[]>;
  findAll(): Promise<Tab[]>;

  search(params: SearchTabsParams): Promise<CopilotTabHit[]>;
  findLatestViewAt(userId: number, tabId: number): Promise<Date | null>;
  recordView(userId: number, tabId: number): Promise<void>;
  findTopViewedByUser(userId: number, order: ViewOrder, take: number): Promise<CopilotTabHit[]>;
  findTopViewedGlobal(order: ViewOrder, take: number): Promise<CopilotTabHit[]>;
  findStaleViewedByUser(userId: number, staleAfterDays: number, take: number): Promise<CopilotTabHit[]>;
  findNeverViewedByUser(userId: number, take: number): Promise<CopilotTabHit[]>;
}
