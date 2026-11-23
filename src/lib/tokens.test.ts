// @vitest-environment node
import { describe, expect, it } from "vitest";
import { generateToken, tokensMatch } from "./tokens";

describe("generateToken", () => {
  it("returns a 32-character URL-safe string", () => {
    expect(generateToken()).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it("returns a different value each time", () => {
    const tokens = new Set(Array.from({ length: 100 }, generateToken));
    expect(tokens.size).toBe(100);
  });
});

describe("tokensMatch", () => {
  it("accepts an identical token", () => {
    expect(tokensMatch("abc123", "abc123")).toBe(true);
  });

  it("rejects a different token of the same length", () => {
    expect(tokensMatch("abc123", "abc124")).toBe(false);
  });

  it("rejects a token of a different length", () => {
    expect(tokensMatch("abc123", "abc")).toBe(false);
    expect(tokensMatch("abc123", "")).toBe(false);
  });
});
