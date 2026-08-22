import { describe, it, expect, beforeEach } from "vitest";
import { CountCatalog } from "../src/use-cases/CountCatalog";
import { Tab } from "../src/entities/Tab";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";

async function saveTab(
  repo: InMemoryTabRepository,
  title: string,
  artist: string,
  genreId: number,
  instrumentId: number,
  userId = 1,
) {
  await repo.save(
    Tab.create(
      title,
      userId,
      genreId,
      instrumentId,
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg",
      artist,
    ),
  );
}

describe("CountCatalog", () => {
  let repo: InMemoryTabRepository;
  let useCase: CountCatalog;

  beforeEach(async () => {
    repo = new InMemoryTabRepository();
    useCase = new CountCatalog(repo);
    await saveTab(repo, "Milo J — One", "Milo J", 4, 1);
    await saveTab(repo, "Rock A", "Queen", 1, 1);
    await saveTab(repo, "Rock B", "AC/DC", 1, 1);
    await saveTab(repo, "Uke Song", "IZ", 3, 3);
  });

  it("counts all tabs when no filters", async () => {
    expect(await useCase.execute({})).toBe(4);
  });

  it("counts by genre and instrument", async () => {
    expect(await useCase.execute({ genreName: "Rock" })).toBe(2);
    expect(await useCase.execute({ instrumentName: "Ukulele" })).toBe(1);
    expect(await useCase.execute({ genreName: "K-Pop" })).toBe(0);
  });
});
