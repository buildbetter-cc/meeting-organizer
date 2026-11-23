import { notFound } from "next/navigation";
import { ServiceError } from "./errors";

/** Runs a poll lookup for a page, showing the 404 page for unknown polls and wrong admin links. */
export async function loadOr404<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (err) {
    if (err instanceof ServiceError && (err.code === "not_found" || err.code === "forbidden")) notFound();
    throw err;
  }
}
