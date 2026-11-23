import type { FieldErrors } from "./errors";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fields: FieldErrors = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Sends JSON to a BetterMeet API route and returns the parsed response, throwing ApiError on failure. */
export async function sendJson<T>(url: string, method: "POST" | "PUT", body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new ApiError("Could not reach BetterMeet. Check your connection and try again.", 0);
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: FieldErrors };
  if (!res.ok) {
    throw new ApiError(data.error ?? "Something went wrong. Please try again.", res.status, data.fields ?? {});
  }
  return data as T;
}
