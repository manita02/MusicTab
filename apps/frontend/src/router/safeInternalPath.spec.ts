import { describe, expect, it } from "vitest";
import { safeInternalPath } from "./safeInternalPath";

describe("safeInternalPath", () => {
  it("keeps relative app paths", () => {
    expect(safeInternalPath("/tabs")).toBe("/tabs");
    expect(safeInternalPath("/tabs?search=x")).toBe("/tabs?search=x");
  });

  it("rejects open redirects", () => {
    expect(safeInternalPath("https://evil.example")).toBe("/");
    expect(safeInternalPath("//evil.example")).toBe("/");
    expect(safeInternalPath("http://localhost/tabs")).toBe("/");
    expect(safeInternalPath(null)).toBe("/");
  });
});
