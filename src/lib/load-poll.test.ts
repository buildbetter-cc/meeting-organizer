import { describe, expect, it, vi } from "vitest";
import { ServiceError } from "./errors";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const { loadOr404 } = await import("./load-poll");

describe("loadOr404", () => {
  it("returns the loaded value", async () => {
    await expect(loadOr404(async () => 42)).resolves.toBe(42);
  });

  it.each(["not_found", "forbidden"] as const)("shows the 404 page for %s", async (code) => {
    await expect(loadOr404(async () => { throw new ServiceError(code, "x"); })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("rethrows other errors", async () => {
    await expect(loadOr404(async () => { throw new Error("db down"); })).rejects.toThrow("db down");
  });
});
