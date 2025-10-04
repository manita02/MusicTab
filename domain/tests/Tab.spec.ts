import { describe, it, expect } from "vitest";
import { Tab } from "../src/entities/Tab";
import { DomainError } from "../src/errors/DomainError";
import { User, Role } from "../src/entities/User";

describe("Tab entity (domain TDD)", () => {
  it("creates a valid tab", () => {
    const tab = Tab.create(
      "Song 1",
      1,
      2, // genreId
      3, // instrumentId
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg"
    );

    expect(tab.id).toBeNull();
    expect(tab.title).toBe("Song 1");
    expect(tab.userId).toBe(1);
    expect(tab.genreId).toBe(2);
    expect(tab.instrumentId).toBe(3);
    expect(tab.urlPdf.getValue()).toBe("http://example.com/tab.pdf");
    expect(tab.urlYoutube.getValue()).toBe("http://youtube.com/video");
    expect(tab.urlImg.getValue()).toBe("http://example.com/img.jpg");
    expect(tab.createdAt).toBeInstanceOf(Date);
  });

  it("throws if title is empty", () => {
    expect(() =>
      Tab.create("", 1, 2, 3, "http://example.com/tab.pdf", "http://youtube.com/video", "http://example.com/img.jpg")
    ).toThrow(DomainError);
  });

  it("throws if genreId or instrumentId are invalid", () => {
    expect(() =>
      Tab.create("Song", 1, 0, 1, "http://example.com/tab.pdf", "http://youtube.com/video", "http://example.com/img.jpg")
    ).toThrow(DomainError);

    expect(() =>
      Tab.create("Song", 1, 1, -5, "http://example.com/tab.pdf", "http://youtube.com/video", "http://example.com/img.jpg")
    ).toThrow(DomainError);
  });

  it("throws if urlPdf, urlYoutube or urlImg are missing", () => {
    expect(() =>
      Tab.create("Song", 1, 1, 1, "", "http://youtube.com/video", "http://example.com/img.jpg")
    ).toThrow(DomainError);

    expect(() =>
      Tab.create("Song", 1, 1, 1, "http://example.com/tab.pdf", "", "http://example.com/img.jpg")
    ).toThrow(DomainError);

    expect(() =>
      Tab.create("Song", 1, 1, 1, "http://example.com/tab.pdf", "http://youtube.com/video", "")
    ).toThrow(DomainError);
  });

  it("canEdit returns true for admin or owner", () => {
    const tab = Tab.create(
      "Song",
      2,
      1,
      1,
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

  it("rehydrates a tab from DB", () => {
    const tab = Tab.rehydrate(
      10,
      "Song DB",
      5,
      2,
      3,
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg",
      new Date("2024-01-01")
    );

    expect(tab.id).toBe(10);
    expect(tab.title).toBe("Song DB");
    expect(tab.userId).toBe(5);
    expect(tab.genreId).toBe(2);
    expect(tab.instrumentId).toBe(3);
    expect(tab.createdAt).toEqual(new Date("2024-01-01"));
  });
});