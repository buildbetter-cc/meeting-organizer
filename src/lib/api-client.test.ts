import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, sendJson } from "./api-client";

afterEach(() => vi.unstubAllGlobals());

const respond = (status: number, body: string) =>
  vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status })));

describe("sendJson", () => {
  it("sends JSON and returns the parsed response", async () => {
    respond(201, '{"id":"x"}');
    await expect(sendJson("/api/x", "POST", { a: 1 })).resolves.toEqual({ id: "x" });
    expect(fetch).toHaveBeenCalledWith("/api/x", expect.objectContaining({ method: "POST", body: '{"a":1}' }));
  });

  it("throws ApiError with the server's message and fields", async () => {
    respond(400, '{"error":"Bad","fields":{"title":"Required"}}');
    await expect(sendJson("/api/x", "POST", {})).rejects.toMatchObject({
      name: "ApiError", message: "Bad", status: 400, fields: { title: "Required" },
    });
  });

  it("uses a generic message when the error body is not JSON", async () => {
    respond(500, "oops");
    await expect(sendJson("/api/x", "PUT", {})).rejects.toMatchObject({ status: 500, message: /Something went wrong/ });
  });

  it("reports network failures", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    const err: unknown = await sendJson("/api/x", "POST", {}).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(0);
  });
});
