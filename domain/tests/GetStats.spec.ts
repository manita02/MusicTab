import { describe, it, expect, beforeEach } from "vitest";
import { Tab } from "../src/entities/Tab";
import { COPILOT_RESULT_LIMIT } from "../src/use-cases/SearchTabs";
import { GetTopViewedGlobal } from "../src/use-cases/GetTopViewedGlobal";
import { GetStatsGlobal } from "../src/use-cases/GetStatsGlobal";
import { GetStatsMe } from "../src/use-cases/GetStatsMe";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";

function makeTab(title: string, userId: number) {
  return Tab.create(
    title,
    userId,
    1,
    1,
    "http://example.com/a.pdf",
    "http://youtube.com/a",
    "http://example.com/a.jpg",
    "Artist"
  );
}

describe("Stats use cases", () => {
  let repo: InMemoryTabRepository;

  beforeEach(async () => {
    repo = new InMemoryTabRepository();
    const tabs = [];
    for (let i = 1; i <= 6; i++) {
      tabs.push(await repo.save(makeTab(`Song ${i}`, 1)));
    }
    const viewer = 9;
    for (let n = 0; n < 5; n++) await repo.recordView(viewer, tabs[0].id!);
    for (let n = 0; n < 3; n++) await repo.recordView(viewer, tabs[1].id!);
    await repo.recordView(viewer, tabs[2].id!);
    await repo.recordView(2, tabs[3].id!);
    await repo.recordView(2, tabs[3].id!);
    await repo.recordView(2, tabs[4].id!);
  });

  it("keeps Copilot global ranking capped at 3", async () => {
    expect(COPILOT_RESULT_LIMIT).toBe(3);
    const hits = await new GetTopViewedGlobal(repo).execute("desc", 10);
    expect(hits).toHaveLength(3);
  });

  it("omits never-opened tabs from global most", async () => {
    const { most } = await new GetStatsGlobal(repo).execute(3);
    expect(most.every((h) => h.viewCount > 0)).toBe(true);
    expect(most.some((h) => h.title === "Song 6")).toBe(false);
  });

  it("returns up to 3 global most/least with least excluding zero views", async () => {
    const { most, least } = await new GetStatsGlobal(repo).execute(10);
    expect(most.length).toBeLessThanOrEqual(3);
    expect(most[0]?.title).toBe("Song 1");
    expect(most.every((h) => h.viewCount > 0)).toBe(true);
    expect(least.every((h) => h.viewCount > 0)).toBe(true);
    expect(least.every((h) => !most.some((m) => m.id === h.id))).toBe(true);
    const mostMin = Math.min(...most.map((h) => h.viewCount));
    expect(least.every((h) => h.viewCount < mostMin)).toBe(true);
  });

  it("builds personal stats kpis and lists", async () => {
    const me = await new GetStatsMe(repo).execute(9);
    expect(me.kpis.distinctTabs).toBe(3);
    expect(me.kpis.events).toBe(9);
    expect(me.kpis.catalogTotal).toBe(6);
    expect(me.kpis.coveragePct).toBe(50);
    expect(me.most[0]?.title).toBe("Song 1");
    expect(me.most[0]?.userViewCount).toBe(5);
    expect(me.never.length).toBeGreaterThan(0);
    expect(me.lastViewed?.title).toBeTruthy();
    expect(me.least.every((h) => !me.most.some((m) => m.id === h.id))).toBe(true);
    expect(me.stale).toHaveLength(0);
  });

  it("does not list recently opened tabs as stale pickup", async () => {
    const oldTab = await repo.save(makeTab("Old Song", 1));
    repo.seedView(9, oldTab.id!, new Date(Date.now() - 10 * 24 * 60 * 60 * 1000));
    const me = await new GetStatsMe(repo).execute(9);
    expect(me.stale.some((h) => h.id === oldTab.id)).toBe(true);
    expect(me.stale.every((h) => h.lastViewedAt)).toBe(true);
  });
});
