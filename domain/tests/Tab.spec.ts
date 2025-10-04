import { describe, it, expect } from "vitest";
import { Tab } from "../src/entities/Tab";
import { DomainError } from "../src/errors/DomainError";
import { User, Role } from "../src/entities/User";

describe("Tab entity (domain TDD)", () => {
  it("creates a valid tab", () => {
    const tab = Tab.create(
      "Song 1",
      1,
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg"
    );

    expect(tab.id).toBeNull();
    expect(tab.title).toBe("Song 1");
    expect(tab.userId).toBe(1);
    expect(tab.urlPdf.getValue()).toBe("http://example.com/tab.pdf");
    expect(tab.urlYoutube.getValue()).toBe("http://youtube.com/video");
    expect(tab.urlImg.getValue()).toBe("http://example.com/img.jpg");
    expect(tab.createdAt).toBeInstanceOf(Date);
  });

  it("throws if title is empty", () => {
    expect(() =>
      Tab.create("", 1, "http://example.com/tab.pdf", "http://youtube.com/video", "http://example.com/img.jpg")
    ).toThrow(DomainError);
  });

  it("throws if urlPdf is missing", () => {
    expect(() =>
      Tab.create("Song", 1, "", "http://youtube.com/video", "http://example.com/img.jpg")
    ).toThrow(DomainError);
  });

  it("throws if urlYoutube is missing", () => {
    expect(() =>
      Tab.create("Song", 1, "http://example.com/tab.pdf", "", "http://example.com/img.jpg")
    ).toThrow(DomainError);
  });

  it("throws if urlImg is missing", () => {
    expect(() =>
      Tab.create("Song", 1, "http://example.com/tab.pdf", "http://youtube.com/video", "")
    ).toThrow(DomainError);
  });

  it("canEdit returns true for admin or owner", () => {
    const tab = Tab.create(
      "Song",
      2,
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg"
    );

    const admin = User.create("admin", "a@a.com", "pass", Role.ADMIN);
    const owner = User.create("owner", "o@o.com", "pass");
    (owner as any).id = 2;

    const other = User.create("other", "x@x.com", "pass");
    (other as any).id = 3;

    expect(tab.canEdit(admin)).toBe(true);
    expect(tab.canEdit(owner)).toBe(true);
    expect(tab.canEdit(other)).toBe(false);
  });
});