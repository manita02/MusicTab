import { describe, expect, it } from "vitest";
import { pickDistinctLeast } from "../src/stats.ranking";
import { CopilotTabHit } from "../src/dto/CopilotTabHit";

function hit(id: number, opens: number, personal = false): CopilotTabHit {
  return {
    id,
    title: `Song ${id}`,
    artist: "A",
    genre: "Rock",
    instrument: "Guitar",
    viewCount: personal ? 99 : opens,
    userViewCount: personal ? opens : undefined,
    createdAt: "2026-01-01",
  };
}

describe("pickDistinctLeast", () => {
  it("drops least items that already appear in most or share the same count", () => {
    const most = [hit(1, 1), hit(2, 1)];
    const least = pickDistinctLeast(most, [hit(2, 1), hit(1, 1)], 3, false);
    expect(least).toEqual([]);
  });

  it("keeps tabs with strictly fewer personal opens", () => {
    const most = [hit(1, 5, true), hit(2, 3, true)];
    const pool = [hit(3, 1, true), hit(2, 3, true), hit(1, 5, true)];
    const least = pickDistinctLeast(most, pool, 3, true);
    expect(least.map((h) => h.id)).toEqual([3]);
  });
});
