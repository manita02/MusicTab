import { describe, it, expect, beforeEach } from "vitest";
import { DeleteUser } from "../src/use-cases/DeleteUser";
import { Role, User } from "../src/entities/User";
import { ConflictError, NotFoundError } from "../src/errors/DomainError";
import { InMemoryUserRepository } from "./fakes/InMemoryUserRepository";

const birth = () => new Date("1993-06-06");
const img = () => "https://example.com/u.png";

describe("DeleteUser use case", () => {
  let repo: InMemoryUserRepository;
  let useCase: DeleteUser;
  let adminId: number;
  let userId: number;

  beforeEach(async () => {
    repo = new InMemoryUserRepository();
    useCase = new DeleteUser(repo);

    const admin = await repo.save(
      User.create("root", "admin@gmail.com", "hashed-admin", Role.ADMIN, birth(), img(), "127.0.0.1"),
    );
    const user = await repo.save(
      User.create("pepe", "pepe@gmail.com", "hashed-secret", Role.USER, birth(), img(), "203.0.113.10"),
    );
    adminId = admin.id!;
    userId = user.id!;
  });

  it("lets a USER delete their own account", async () => {
    await useCase.execute({ actorId: userId, actorRole: Role.USER, targetId: userId });
    expect(await repo.findById(userId)).toBeNull();
  });

  it("forbids a USER from deleting another account", async () => {
    await expect(
      useCase.execute({ actorId: userId, actorRole: Role.USER, targetId: adminId }),
    ).rejects.toMatchObject({ code: "AuthError" });
    expect(await repo.findById(adminId)).not.toBeNull();
  });

  it("lets an ADMIN delete another user", async () => {
    await useCase.execute({ actorId: adminId, actorRole: Role.ADMIN, targetId: userId });
    expect(await repo.findById(userId)).toBeNull();
  });

  it("forbids an ADMIN from deleting themselves", async () => {
    await expect(
      useCase.execute({ actorId: adminId, actorRole: Role.ADMIN, targetId: adminId }),
    ).rejects.toMatchObject({ code: "AuthError" });
    expect(await repo.findById(adminId)).not.toBeNull();
  });

  it("rejects deleting the last remaining administrator", async () => {
    const extra = await repo.save(
      User.create("second", "second@gmail.com", "hashed-2", Role.ADMIN, birth(), img(), "10.0.0.2"),
    );

    await useCase.execute({ actorId: adminId, actorRole: Role.ADMIN, targetId: extra.id! });

    await expect(
      useCase.execute({ actorId: 99, actorRole: Role.ADMIN, targetId: adminId }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(await repo.findById(adminId)).not.toBeNull();
  });

  it("rejects a missing target", async () => {
    await expect(
      useCase.execute({ actorId: adminId, actorRole: Role.ADMIN, targetId: 999 }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
