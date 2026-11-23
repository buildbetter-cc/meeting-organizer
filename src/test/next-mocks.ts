import { vi } from "vitest";

/** Shared mock router for components that call useRouter(). */
export const router = { push: vi.fn(), refresh: vi.fn() };

/** Stubs fetch so each call returns the next queued response. */
export function queueFetch(...responses: { status: number; body: unknown }[]) {
  const fn = vi.fn(async () => {
    const r = responses.shift() ?? { status: 500, body: {} };
    return new Response(JSON.stringify(r.body), { status: r.status });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

export function sentBody(fetchMock: ReturnType<typeof queueFetch>, call = 0): unknown {
  const init = fetchMock.mock.calls[call] as unknown as [string, RequestInit];
  return JSON.parse(String(init[1].body));
}
