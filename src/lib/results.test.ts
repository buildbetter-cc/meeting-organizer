import { describe, expect, it } from "vitest";
import { bestSlotIds, tallyYes } from "./results";

const slots = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("tallyYes", () => {
  it("counts yes answers per slot, including zeros", () => {
    const votes = [
      { choices: [{ slotId: "a", answer: "yes" as const }, { slotId: "b", answer: "no" as const }] },
      { choices: [{ slotId: "a", answer: "yes" as const }, { slotId: "b", answer: "yes" as const }] },
    ];
    expect(tallyYes(slots, votes)).toEqual({ a: 2, b: 1, c: 0 });
  });

  it("ignores answers for slots that are not listed", () => {
    expect(tallyYes(slots, [{ choices: [{ slotId: "zzz", answer: "yes" }] }])).toEqual({ a: 0, b: 0, c: 0 });
  });
});

describe("bestSlotIds", () => {
  it("returns the slot with the most yes answers", () => {
    expect(bestSlotIds({ a: 1, b: 3, c: 2 })).toEqual(["b"]);
  });

  it("returns every slot tied for the most", () => {
    expect(bestSlotIds({ a: 2, b: 2, c: 1 })).toEqual(["a", "b"]);
  });

  it("returns nothing when nobody has said yes", () => {
    expect(bestSlotIds({ a: 0, b: 0 })).toEqual([]);
    expect(bestSlotIds({})).toEqual([]);
  });
});
