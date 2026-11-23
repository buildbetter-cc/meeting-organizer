// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ prisma: {} }));

describe("getPollService", () => {
  it("returns the same service instance every time", async () => {
    const { getPollService } = await import("./service");
    const service = getPollService();
    expect(typeof service.createPoll).toBe("function");
    expect(getPollService()).toBe(service);
  });
});
