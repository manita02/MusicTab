import { describe, it, expect } from "vitest";
import { Role, User } from "../src/entities/User";
import { toUserPublic } from "../src/dto/UserPublic";

describe("toUserPublic", () => {
  it("never includes passwordHash and only adds signupIp for admins", () => {
    const user = User.rehydrate(
      1,
      "root",
      "admin@gmail.com",
      "secret-hash",
      Role.ADMIN,
      new Date("2024-01-01"),
      new Date("1993-06-06"),
      "https://example.com/u.png",
      "127.0.0.1",
    );

    const hidden = toUserPublic(user, false);
    expect(hidden).not.toHaveProperty("passwordHash");
    expect(hidden).not.toHaveProperty("signupIp");
    expect(JSON.stringify(hidden)).not.toContain("secret-hash");

    const visible = toUserPublic(user, true);
    expect(visible.signupIp).toBe("127.0.0.1");
    expect(JSON.stringify(visible)).not.toContain("secret-hash");
  });
});
