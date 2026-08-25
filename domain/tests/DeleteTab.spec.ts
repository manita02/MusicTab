import { describe, it, expect, beforeEach } from "vitest";
import { CreateTab } from "../src/use-cases/CreateTab";
import { DeleteTab } from "../src/use-cases/DeleteTab";
import { Role, User } from "../src/entities/User";
import { DomainError } from "../src/errors/DomainError";
import { InMemoryTabRepository } from "./fakes/InMemoryTabRepository";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";

const birth = () => new Date("1995-06-01");
const img = () => "https://example.com/avatar.png";

describe("DeleteTab use case", () => {
  let tabRepo: InMemoryTabRepository;
  let userRepo: InMemoryUserRepository;
  let createTab: CreateTab;
  let deleteTab: DeleteTab;
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
    deleteTab = new DeleteTab(tabRepo, userRepo);

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

  it("lets the owner admin delete their tab", async () => {
    await deleteTab.execute(ownedTabId, ownerAdminId);
    expect(await tabRepo.findById(ownedTabId)).toBeNull();
  });

  it("rejects an admin who does not own the tab and does not delete it", async () => {
    await expect(deleteTab.execute(ownedTabId, otherAdminId)).rejects.toMatchObject({
      code: "AuthError",
      message: "You can only delete tabs you created",
    });

    expect(await tabRepo.findById(ownedTabId)).not.toBeNull();
  });

  it("rejects a USER and does not delete the tab", async () => {
    await expect(deleteTab.execute(ownedTabId, userId)).rejects.toMatchObject({
      code: "AuthError",
      message: "Only administrators can delete tabs",
    });

    expect(await tabRepo.findById(ownedTabId)).not.toBeNull();
  });

  it("throws if the tab does not exist", async () => {
    await expect(deleteTab.execute(999, ownerAdminId)).rejects.toBeInstanceOf(DomainError);
  });
});
