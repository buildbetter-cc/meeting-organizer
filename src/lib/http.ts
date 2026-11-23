import { ServiceError, httpStatusFor } from "./errors";

/** Parses a JSON request body, turning malformed JSON into a validation error. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ServiceError("validation", "Request body must be valid JSON.");
  }
}

export function errorResponse(err: unknown): Response {
  if (err instanceof ServiceError) {
    return Response.json({ error: err.message, fields: err.fields }, { status: httpStatusFor(err.code) });
  }
  console.error(err);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/** Runs a route handler body and converts thrown errors into JSON responses. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    return errorResponse(err);
  }
}
