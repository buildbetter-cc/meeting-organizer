import { describe, expect, it } from "vitest";
import { ServiceError, httpStatusFor } from "./errors";

describe("ServiceError", () => {
  it("keeps its code, message and field errors", () => {
    const err = new ServiceError("validation", "Bad input", { title: "Required" });
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("validation");
    expect(err.message).toBe("Bad input");
    expect(err.fields).toEqual({ title: "Required" });
  });

  it("defaults to no field errors", () => {
    expect(new ServiceError("not_found", "Missing").fields).toEqual({});
  });
});

describe("httpStatusFor", () => {
  it.each([
    ["validation", 400],
    ["forbidden", 403],
    ["not_found", 404],
    ["closed", 409],
  ] as const)("maps %s to %i", (code, status) => {
    expect(httpStatusFor(code)).toBe(status);
  });
});
