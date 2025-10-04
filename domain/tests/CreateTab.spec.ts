import { describe, it, expect, beforeEach } from "vitest";
import { CreateTab } from "../src/use-cases/CreateTab";
import { ITabRepository } from "../src/repositories/ITabRepository";
import { Tab } from "../src/entities/Tab";
import { Role, User } from "../src/entities/User";
import { IUserRepository } from "../src/repositories/IUserRepository";
import { DomainError } from "../src/errors/DomainError";

/** In-memory Tab repository for tests */
class InMemoryTabRepository implements ITabRepository {
    private tabs: Tab[] = [];
    private idCounter = 1;
  
    async save(tab: Tab): Promise<Tab> {
      if (tab.id === null) {
        const newTab = Tab.rehydrate(
          this.idCounter++,
          tab.title,
          tab.userId,
          tab.urlPdf.getValue(),
          tab.urlYoutube.getValue(),
          tab.urlImg.getValue(),
          tab.createdAt
        );
        this.tabs.push(newTab);
        return newTab;
      } else {
        const index = this.tabs.findIndex(t => t.id === tab.id);
        if (index >= 0) this.tabs[index] = tab;
        return tab;
      }
    }
  
    async findById(id: number): Promise<Tab | null> {
      return this.tabs.find(t => t.id === id) ?? null;
    }
  
    async findByUser(userId: number): Promise<Tab[]> {
      return this.tabs.filter(t => t.userId === userId);
    }
  
    async countByUserAndDate(userId: number, date: Date): Promise<number> {
      const dateString = date.toISOString().split("T")[0];
      return this.tabs.filter(
        t => t.userId === userId && t.createdAt.toISOString().split("T")[0] === dateString
      ).length;
    }
  
    async delete(id: number): Promise<void> {
      this.tabs = this.tabs.filter(t => t.id !== id);
    }
}
  
/** In-memory User repo for tests (igual que RegisterUser.spec.ts) */
class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: number) {
    return this.users.find(u => u.id === id) ?? null;
  }

  async save(user: User) {
    const newId = this.users.length + 1;
    const rehydrated = User.rehydrate(newId, user.username, user.email.toString(), user.passwordHash, user.role, user.createdAt);
    this.users.push(rehydrated);
    return rehydrated;
  }

  async deleteById(id: number) {
    this.users = this.users.filter(u => u.id !== id);
  }

  async findByEmail(email: string) {
    return this.users.find(u => u.email.toString() === email) ?? null;
  }
}

describe("CreateTab use case (domain TDD)", () => {
  let tabRepo: InMemoryTabRepository;
  let userRepo: InMemoryUserRepository;
  let useCase: CreateTab;
  let normalUser: User;
  let adminUser: User;

  beforeEach(async () => {
    tabRepo = new InMemoryTabRepository();
    userRepo = new InMemoryUserRepository();
    useCase = new CreateTab(tabRepo, userRepo);

    normalUser = await userRepo.save(User.create("user", "user@u.com", "pass"));
    adminUser = await userRepo.save(User.create("admin", "admin@a.com", "pass", Role.ADMIN));
  });

  it("allows a normal user to create up to 3 tabs per day", async () => {
    for (let i = 0; i < 3; i++) {
      const tab = await useCase.execute({
        title: `Song ${i + 1}`,
        userId: normalUser.id!,
        urlPdf: "http://example.com/tab.pdf",
        urlYoutube: "http://youtube.com/video",
        urlImg: "http://example.com/img.jpg"
      });
      expect(tab.id).toBeDefined();
    }

    await expect(
      useCase.execute({
        title: "Song 4",
        userId: normalUser.id!,
        urlPdf: "http://example.com/tab.pdf",
        urlYoutube: "http://youtube.com/video",
        urlImg: "http://example.com/img.jpg"
      })
    ).rejects.toThrow(DomainError);
  });

  it("allows admin user to create more than 3 tabs", async () => {
    for (let i = 0; i < 5; i++) {
      const tab = await useCase.execute({
        title: `Admin Song ${i + 1}`,
        userId: adminUser.id!,
        urlPdf: "http://example.com/tab.pdf",
        urlYoutube: "http://youtube.com/video",
        urlImg: "http://example.com/img.jpg"
      });
      expect(tab.id).toBeDefined();
    }
  });

  it("throws if user does not exist", async () => {
    await expect(
      useCase.execute({
        title: "Song X",
        userId: 999,
        urlPdf: "http://example.com/tab.pdf",
        urlYoutube: "http://youtube.com/video",
        urlImg: "http://example.com/img.jpg"
      })
    ).rejects.toThrow(DomainError);
  });
});
