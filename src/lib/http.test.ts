// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { ServiceError } from "./errors";
import { errorResponse, handle, readJson } from "./http";

describe("readJson", () => {
  it("parses a JSON body", async () => {
    const req = new Request("http://x", { method: "POST", body: '{"a":1}' });
    expect(await readJson(req)).toEqual({ a: 1 });
  });

  it("throws a validation error for malformed JSON", async () => {
    const req = new Request("http://x", { method: "POST", body: "{nope" });
    await expect(readJson(req)).rejects.toMatchObject({ code: "validation" });
  });
});

describe("errorResponse", () => {
  it("uses the service error's status, message and fields", async () => {
    const res = errorResponse(new ServiceError("validation", "Bad", { title: "Required" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Bad", fields: { title: "Required" } });
  });

  it("hides unexpected errors behind a 500", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = errorResponse(new Error("db password leaked"));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("password");
    spy.mockRestore();
  });
});

describe("handle", () => {
  it("returns the handler's response", async () => {
    const res = await handle(async () => Response.json({ ok: true }, { status: 201 }));
    expect(res.status).toBe(201);
  });

  it("converts a thrown service error into a response", async () => {
    const res = await handle(async () => {
      throw new ServiceError("closed", "Closed");
    });
    expect(res.status).toBe(409);
  });
});
