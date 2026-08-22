export type CopilotHistoryRole = "user" | "assistant";

export type CopilotHistoryMessage = {
  role: CopilotHistoryRole;
  content: string;
};

/** Hit del catálogo para el chat. Nunca incluye urlPdf. */
export type CopilotTabHit = {
  id: number;
  title: string;
  artist: string;
  genre: string;
  instrument: string;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
};

export type CopilotQuota = {
  used: number;
  limit: number;
  remaining: number;
  resetAt?: string;
};

export type CopilotChatRequest = {
  message: string;
  history?: CopilotHistoryMessage[];
};

export type CopilotChatResponse = {
  reply: string;
  hits: CopilotTabHit[];
  quota: Pick<CopilotQuota, "used" | "remaining" | "limit">;
};

export function sanitizeCopilotHits(hits: unknown): CopilotTabHit[] {
  if (!Array.isArray(hits)) return [];
  return hits.slice(0, 3).flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const h = raw as Record<string, unknown>;
    const title = String(h.title ?? "").trim();
    if (!title) return [];
    const hit: CopilotTabHit = {
      id: Number(h.id) || 0,
      title,
      artist: String(h.artist ?? ""),
      genre: String(h.genre ?? ""),
      instrument: String(h.instrument ?? ""),
      viewCount: Number(h.viewCount) || 0,
      createdAt: String(h.createdAt ?? ""),
    };
    if (typeof h.lastViewedAt === "string" && h.lastViewedAt) {
      hit.lastViewedAt = h.lastViewedAt;
    }
    return [hit];
  });
}
