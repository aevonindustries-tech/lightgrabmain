import { describe, expect, it } from "vitest";
import { isPublicSiteOpen } from "./launch-visibility";

describe("public launch visibility", () => {
  it("keeps the customer homepage hidden before launch or while launch status is unknown", () => {
    expect(isPublicSiteOpen(false)).toBe(false);
    expect(isPublicSiteOpen(undefined)).toBe(false);
  });

  it("opens the customer homepage only when launch is live", () => {
    expect(isPublicSiteOpen(true)).toBe(true);
  });
});