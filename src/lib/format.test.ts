import { describe, expect, it } from "vitest";
import { formatSlotParts, localToIso } from "./format";

describe("formatSlotParts", () => {
  it("formats a same-day slot as a date line and a time range", () => {
    const parts = formatSlotParts("2026-12-01T03:00:00Z", "2026-12-01T04:30:00Z", { locale: "en-GB", timeZone: "UTC" });
    expect(parts).toEqual({ date: "Tue 1 Dec", time: "03:00 – 04:30" });
  });

  it("uses the given time zone", () => {
    const parts = formatSlotParts("2026-12-01T03:00:00Z", "2026-12-01T04:00:00Z", { locale: "en-GB", timeZone: "Asia/Bangkok" });
    expect(parts.time).toBe("10:00 – 11:00");
  });

  it("includes the end date when the slot crosses midnight", () => {
    const parts = formatSlotParts("2026-12-01T23:00:00Z", "2026-12-02T01:00:00Z", { locale: "en-GB", timeZone: "UTC" });
    expect(parts.time).toBe("23:00 – Wed 2 Dec, 01:00");
  });
});

describe("localToIso", () => {
  it("converts a local date and time to an ISO string", () => {
    expect(localToIso("2026-12-01", "10:15")).toBe(new Date(2026, 11, 1, 10, 15).toISOString());
  });

  it("returns an empty string for missing or malformed input", () => {
    expect(localToIso("", "10:00")).toBe("");
    expect(localToIso("2026-12-01", "")).toBe("");
    expect(localToIso("01/12/2026", "10:00")).toBe("");
    expect(localToIso("2026-13-45", "10:00")).toBe("");
  });
});
