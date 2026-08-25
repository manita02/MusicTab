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
    expect(tab.artist).toBe("");
    expect(tab.viewCount).toBe(0);
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

  it("canEdit returns true only for the admin who owns the tab", () => {
    const tab = Tab.rehydrate(
      10,
      "Song",
      2,
      1,
      1,
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg",
    );

    const ownerAdmin = User.rehydrate(
      2,
      "admin",
      "admin@gmail.com",
      "pass",
      Role.ADMIN,
      new Date("2024-01-01"),
      new Date("1990-01-01"),
      "https://x.com/a.png",
    );
    const otherAdmin = User.rehydrate(
      3,
      "other-admin",
      "other-admin@gmail.com",
      "pass",
      Role.ADMIN,
      new Date("2024-01-01"),
      new Date("1990-01-01"),
      "https://x.com/oa.png",
    );
    const ownerUser = User.rehydrate(
      2,
      "owner",
      "owner@gmail.com",
      "pass",
      Role.USER,
      new Date("2024-01-01"),
      new Date("1990-01-01"),
      "https://x.com/o.png",
    );
    const otherUser = User.rehydrate(
      4,
      "other",
      "other@outlook.com",
      "pass",
      Role.USER,
      new Date("2024-01-01"),
      new Date("1991-01-01"),
      "https://x.com/x.png",
    );
    const unsavedAdmin = User.create(
      "admin",
      "unsaved-admin@gmail.com",
      "pass",
      Role.ADMIN,
      new Date("1990-01-01"),
      "https://x.com/a.png",
    );

    expect(tab.canEdit(ownerAdmin)).toBe(true);
    expect(tab.canDelete(ownerAdmin)).toBe(true);
    expect(tab.canEdit(otherAdmin)).toBe(false);
    expect(tab.canDelete(otherAdmin)).toBe(false);
    expect(tab.canEdit(ownerUser)).toBe(false);
    expect(tab.canEdit(otherUser)).toBe(false);
    expect(tab.canEdit(unsavedAdmin)).toBe(false);
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
    expect(tab.artist).toBe("");
    expect(tab.viewCount).toBe(0);
  });

  it("trims artist on create and allows empty artist on rehydrate (legacy rows)", () => {
    const created = Tab.create(
      "Song",
      1,
      1,
      1,
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg",
      "  Milo J  "
    );
    expect(created.artist).toBe("Milo J");

    const legacy = Tab.rehydrate(
      1,
      "Old Song",
      1,
      1,
      1,
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg"
    );
    expect(legacy.artist).toBe("");
  });

  it("updates artist", () => {
    const tab = Tab.create(
      "Song",
      1,
      1,
      1,
      "http://example.com/tab.pdf",
      "http://youtube.com/video",
      "http://example.com/img.jpg",
      "Old"
    );
    const updated = tab.update({ artist: "  New Artist  " });
    expect(updated.artist).toBe("New Artist");
    expect(updated.title).toBe("Song");
  });
});