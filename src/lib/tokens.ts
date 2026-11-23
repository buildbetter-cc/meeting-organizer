import { randomBytes, timingSafeEqual } from "node:crypto";

/** A random, URL-safe secret (192 bits). */
export function generateToken(): string {
  return randomBytes(24).toString("base64url");
}

/** Compares two secrets in constant time. */
export function tokensMatch(expected: string, given: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}
