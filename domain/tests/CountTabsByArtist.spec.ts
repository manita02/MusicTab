import { describe, it, expect, beforeEach } from "vitest";
import { CountTabsByArtist } from "../src/use-cases/CountTabsByArtist";
import { SearchTabs } from "../src/use-cases/SearchTabs";
import { Tab } from "../src/entities/Tab";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";

function saveTab(repo: InMemoryTabRepository, title: string, artist: string) {
  return repo.save(
    Tab.create(
      title,
      1,
      1,
      1,
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg",
      artist
    )
  );
}

describe("CountTabsByArtist", () => {
  let tabRepo: InMemoryTabRepository;
  let countUseCase: CountTabsByArtist;
  let searchUseCase: SearchTabs;

  beforeEach(async () => {
    tabRepo = new InMemoryTabRepository();
    countUseCase = new CountTabsByArtist(tabRepo);
    searchUseCase = new SearchTabs(tabRepo);

    await saveTab(tabRepo, "Milo J — One", "Milo J");
    await saveTab(tabRepo, "Milo J — Two", "Milo J");
    await saveTab(tabRepo, "Milo J — Three", "Milo J");
    await saveTab(tabRepo, "Milo J — Four", "Milo J");
    await saveTab(tabRepo, "Rock A", "Queen");
  });

  it("counts all matching tabs even when search is capped at 3", async () => {
    const count = await countUseCase.execute("Milo J");
    const hits = await searchUseCase.execute({ artist: "Milo J", take: 3 });
    expect(count).toBe(4);
    expect(hits).toHaveLength(3);
  });

  it("is case-insensitive and returns 0 for empty artist", async () => {
    expect(await countUseCase.execute("milo j")).toBe(4);
    expect(await countUseCase.execute("   ")).toBe(0);
    expect(await countUseCase.execute("Nobody")).toBe(0);
  });
});
