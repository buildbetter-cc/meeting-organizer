import { afterEach, describe, expect, it, vi } from "vitest";
import { loadMyVote, saveMyVote } from "./vote-storage";

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("vote storage", () => {
  it("saves and loads a vote per poll", () => {
    expect(saveMyVote("p1", { voteId: "v1", editToken: "t1" })).toBe(true);
    expect(loadMyVote("p1")).toEqual({ voteId: "v1", editToken: "t1" });
    expect(loadMyVote("p2")).toBeNull();
  });

  it("ignores malformed stored data", () => {
    window.localStorage.setItem("bettermeet:vote:p1", "{not json");
    expect(loadMyVote("p1")).toBeNull();
    window.localStorage.setItem("bettermeet:vote:p1", JSON.stringify({ voteId: 1 }));
    expect(loadMyVote("p1")).toBeNull();
  });

  it("does not throw when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadMyVote("p1")).toBeNull();
    expect(saveMyVote("p1", { voteId: "v1", editToken: "t1" })).toBe(false);
  });
});
