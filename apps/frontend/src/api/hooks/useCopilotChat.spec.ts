import { describe, expect, it } from "vitest";
import { lastHistoryForRequest } from "./useCopilotChat";
import { sanitizeCopilotHits } from "../copilot.types";

describe("lastHistoryForRequest", () => {
  it("envía solo los últimos 4 mensajes", () => {
    const history = [
      { role: "user" as const, content: "1" },
      { role: "assistant" as const, content: "2" },
      { role: "user" as const, content: "3" },
      { role: "assistant" as const, content: "4" },
      { role: "user" as const, content: "5" },
      { role: "assistant" as const, content: "6" },
    ];
    expect(lastHistoryForRequest(history)).toEqual([
      { role: "user", content: "3" },
      { role: "assistant", content: "4" },
      { role: "user", content: "5" },
      { role: "assistant", content: "6" },
    ]);
  });
});

describe("sanitizeCopilotHits", () => {
  it("no incluye urlPdf y recorta a 3", () => {
    const hits = sanitizeCopilotHits([
      {
        id: 1,
        title: "Rara Vez",
        artist: "Milo J",
        genre: "Trap",
        instrument: "Guitar",
        viewCount: 2,
        createdAt: "2024-01-01",
        urlPdf: "https://secret.example/tab.pdf",
      },
      { id: 2, title: "B", artist: "A", genre: "Rock", instrument: "Guitar", viewCount: 0, createdAt: "2024" },
      { id: 3, title: "C", artist: "A", genre: "Rock", instrument: "Piano", viewCount: 0, createdAt: "2024" },
      { id: 4, title: "D", artist: "A", genre: "Jazz", instrument: "Ukulele", viewCount: 0, createdAt: "2024" },
    ]);
    expect(hits).toHaveLength(3);
    expect(hits[0]).toMatchObject({ title: "Rara Vez", artist: "Milo J" });
    expect(JSON.stringify(hits)).not.toContain("urlPdf");
    expect(JSON.stringify(hits)).not.toContain("secret.example");
  });
});
