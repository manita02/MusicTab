import { describe, it, expect, beforeEach } from "vitest";
import { SearchTabs } from "../src/use-cases/SearchTabs";
import { Tab } from "../src/entities/Tab";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";

function makeTab(title: string, artist: string, genreId: number, instrumentId: number, createdAt: Date) {
  const tab = Tab.create(
    title,
    1,
    genreId,
    instrumentId,
    "http://example.com/tab.pdf",
    "http://youtube.com/video",
    "http://example.com/img.jpg",
    artist
  );
  return Tab.rehydrate(
    0,
    tab.title,
    tab.userId,
    tab.genreId,
    tab.instrumentId,
    tab.urlPdf.getValue(),
    tab.urlYoutube.getValue(),
    tab.urlImg.getValue(),
    createdAt,
    undefined,
    tab.artist,
    0
  );
}

describe("SearchTabs", () => {
  let tabRepo: InMemoryTabRepository;
  let useCase: SearchTabs;

  beforeEach(async () => {
    tabRepo = new InMemoryTabRepository();
    useCase = new SearchTabs(tabRepo);

    const samples = [
      makeTab("Milo J — One", "Milo J", 4, 1, new Date("2024-01-01")),
      makeTab("Milo J — Two", "Milo J", 3, 2, new Date("2024-02-01")),
      makeTab("Rock A", "Queen", 1, 1, new Date("2024-03-01")),
      makeTab("Rock B", "AC/DC", 1, 1, new Date("2024-04-01")),
      makeTab("Rock C", "Nirvana", 1, 1, new Date("2024-05-01")),
      makeTab("Rock D", "Foo Fighters", 1, 1, new Date("2024-06-01")),
      makeTab("Uke Song", "IZ", 3, 3, new Date("2024-07-01")),
    ];

    for (const t of samples) {
      await tabRepo.save(
        Tab.create(
          t.title,
          t.userId,
          t.genreId,
          t.instrumentId,
          t.urlPdf.getValue(),
          t.urlYoutube.getValue(),
          t.urlImg.getValue(),
          t.artist
        )
      );
    }
  });

  it("always returns at most 3 hits even if take is larger", async () => {
    const hits = await useCase.execute({ genreName: "Rock", take: 10 });
    expect(hits.length).toBeLessThanOrEqual(3);
    expect(hits).toHaveLength(3);
  });

  it("filters by artist with case-insensitive LIKE", async () => {
    const hits = await useCase.execute({ artist: "milo j" });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.artist.toLowerCase().includes("milo j"))).toBe(true);
    expect(hits.every((h) => !("urlPdf" in h) && !("urlYoutube" in h))).toBe(true);
  });

  it("combines artist and genre name (rock de Milo J) and never uses hallucinated ids", async () => {
    await tabRepo.save(
      Tab.create(
        "Milo J — Rock Hit",
        1,
        1,
        1,
        "http://example.com/tab.pdf",
        "http://youtube.com/video",
        "http://example.com/img.jpg",
        "Milo J"
      )
    );
    const hits = await useCase.execute({ artist: "Milo J", genreName: "Rock" });
    expect(hits.length).toBeLessThanOrEqual(3);
    expect(hits.every((h) => h.artist === "Milo J" && h.genre === "Rock")).toBe(true);
  });

  it("returns empty when genre name is not in the catalog", async () => {
    const hits = await useCase.execute({ genreName: "K-Pop" });
    expect(hits).toEqual([]);
  });

  it("filters by instrument name", async () => {
    const hits = await useCase.execute({ instrumentName: "Ukulele" });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.instrument === "Ukulele")).toBe(true);
  });
});
