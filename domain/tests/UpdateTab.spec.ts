import { describe, it, expect, beforeEach } from "vitest";
import { CreateTab } from "../src/use-cases/CreateTab";
import { UpdateTab } from "../src/use-cases/UpdateTab";
import { Role, User } from "../src/entities/User";
import { DomainError } from "../src/errors/DomainError";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";

const birth = () => new Date("1995-06-01");
const img = () => "https://example.com/avatar.png";

describe("UpdateTab use case", () => {
  let tabRepo: InMemoryTabRepository;
  let userRepo: InMemoryUserRepository;
  let createTab: CreateTab;
  let updateTab: UpdateTab;
  let ownerAdminId: number;
  let otherAdminId: number;
  let userId: number;
  let ownedTabId: number;

  const payload = {
    title: "Song 1",
    artist: "Test Artist",
    genreId: 1,
    instrumentId: 1,
    urlPdf: "http://example.com/tab.pdf",
    urlYoutube: "http://youtube.com/video",
    urlImg: "http://example.com/img.jpg",
  };

  beforeEach(async () => {
    tabRepo = new InMemoryTabRepository();
    userRepo = new InMemoryUserRepository();
    createTab = new CreateTab(tabRepo, userRepo);
    updateTab = new UpdateTab(tabRepo, userRepo);

    const ownerAdmin = await userRepo.save(
      User.create("owneradmin", "owner-admin@gmail.com", "hash", Role.ADMIN, birth(), img()),
    );
    const otherAdmin = await userRepo.save(
      User.create("otheradmin", "other-admin@gmail.com", "hash", Role.ADMIN, birth(), img()),
    );
    const user = await userRepo.save(
      User.create("user", "user@gmail.com", "hash", Role.USER, birth(), img()),
    );

    ownerAdminId = ownerAdmin.id!;
    otherAdminId = otherAdmin.id!;
    userId = user.id!;

    const tab = await createTab.execute({ ...payload, userId: ownerAdminId });
    ownedTabId = tab.id!;
  });

  it("lets the owner admin update their tab", async () => {
    const updated = await updateTab.execute({
      id: ownedTabId,
      userId: ownerAdminId,
      title: "Song 1 updated",
    });

    expect(updated.title).toBe("Song 1 updated");
    const stored = await tabRepo.findById(ownedTabId);
    expect(stored?.title).toBe("Song 1 updated");
  });

  it("rejects an admin who does not own the tab", async () => {
    await expect(
      updateTab.execute({
        id: ownedTabId,
        userId: otherAdminId,
        title: "hacked",
      }),
    ).rejects.toMatchObject({
      code: "AuthError",
      message: "You can only edit tabs you created",
    });

    const stored = await tabRepo.findById(ownedTabId);
    expect(stored?.title).toBe("Song 1");
  });

  it("rejects a USER", async () => {
    await expect(
      updateTab.execute({
        id: ownedTabId,
        userId,
        title: "hacked",
      }),
    ).rejects.toMatchObject({
      code: "AuthError",
      message: "Only administrators can edit tabs",
    });

    const stored = await tabRepo.findById(ownedTabId);
    expect(stored?.title).toBe("Song 1");
  });

  it("throws if the tab does not exist", async () => {
    await expect(
      updateTab.execute({
        id: 999,
        userId: ownerAdminId,
        title: "missing",
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});
