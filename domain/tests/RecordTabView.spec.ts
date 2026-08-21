import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RecordTabView } from "../src/use-cases/RecordTabView";
import { Tab } from "../src/entities/Tab";
import { NotFoundError } from "../src/errors/DomainError";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";

describe("RecordTabView", () => {
  let tabRepo: InMemoryTabRepository;
  let useCase: RecordTabView;
  let tabId: number;

  beforeEach(async () => {
    tabRepo = new InMemoryTabRepository();
    useCase = new RecordTabView(tabRepo);
    const saved = await tabRepo.save(
      Tab.create(
        "Song 1",
        1,
        1,
        1,
        "http://example.com/tab.pdf",
        "http://youtube.com/video",
        "http://example.com/img.jpg",
        "Artist"
      )
    );
    tabId = saved.id!;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records a first view (counted true) and increments viewCount", async () => {
    const result = await useCase.execute(10, tabId);
    expect(result.counted).toBe(true);
    const tab = await tabRepo.findById(tabId);
    expect(tab?.viewCount).toBe(1);
  });

  it("does not insert nor increment within 30 minutes for the same userId+tabId", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));

    await useCase.execute(10, tabId);
    vi.setSystemTime(new Date("2026-01-01T12:29:59.000Z"));
    const second = await useCase.execute(10, tabId);

    expect(second.counted).toBe(false);
    const tab = await tabRepo.findById(tabId);
    expect(tab?.viewCount).toBe(1);
  });

  it("counts again after the 30 minute window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));

    await useCase.execute(10, tabId);
    vi.setSystemTime(new Date("2026-01-01T12:30:00.000Z"));
    const second = await useCase.execute(10, tabId);

    expect(second.counted).toBe(true);
    const tab = await tabRepo.findById(tabId);
    expect(tab?.viewCount).toBe(2);
  });

  it("allows another user to record a view of the same tab immediately", async () => {
    await useCase.execute(10, tabId);
    const other = await useCase.execute(11, tabId);
    expect(other.counted).toBe(true);
    const tab = await tabRepo.findById(tabId);
    expect(tab?.viewCount).toBe(2);
  });

  it("throws NotFound when the tab does not exist", async () => {
    await expect(useCase.execute(10, 999)).rejects.toBeInstanceOf(NotFoundError);
  });
});
