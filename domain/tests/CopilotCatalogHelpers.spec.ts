import { describe, it, expect, beforeEach } from "vitest";
import { CountMyViews } from "../src/use-cases/CountMyViews";
import { GetLastViewedByUser } from "../src/use-cases/GetLastViewedByUser";
import { GetTabsByUser } from "../src/use-cases/GetTabsByUser";
import { ListDistinctArtists } from "../src/use-cases/ListDistinctArtists";
import { Tab } from "../src/entities/Tab";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";

describe("Copilot catalog helpers", () => {
  let repo: InMemoryTabRepository;

  beforeEach(async () => {
    repo = new InMemoryTabRepository();
    const a = await repo.save(
      Tab.create("Song A", 1, 1, 1, "http://example.com/a.pdf", "http://youtube.com/a", "http://example.com/a.jpg", "Queen"),
    );
    await repo.save(
      Tab.create("Song B", 2, 2, 2, "http://example.com/b.pdf", "http://youtube.com/b", "http://example.com/b.jpg", "Milo J"),
    );
    repo.seedView(9, a.id!, new Date("2024-01-01"));
    repo.seedView(9, a.id!, new Date("2024-02-01"));
  });

  it("lists distinct artists", async () => {
    const names = await new ListDistinctArtists(repo).execute();
    expect(names).toEqual(["Milo J", "Queen"]);
  });

  it("returns last viewed tab and view stats", async () => {
    const last = await new GetLastViewedByUser(repo).execute(9);
    expect(last?.title).toBe("Song A");
    const stats = await new CountMyViews(repo).execute(9);
    expect(stats.events).toBe(2);
    expect(stats.distinctTabs).toBe(1);
  });

  it("counts tabs uploaded by a user id regardless of role", async () => {
    const result = await new GetTabsByUser(repo).execute(2, 3);
    expect(result.total).toBe(1);
    expect(result.hits[0]?.title).toBe("Song B");
  });
});
