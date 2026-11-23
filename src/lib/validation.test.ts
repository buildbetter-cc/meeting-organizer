import { describe, expect, it } from "vitest";
import { LIMITS, validateCreatePoll, validateVote } from "./validation";

const slot = (start: string, end: string) => ({ startAt: start, endAt: end });
const validPoll = {
  title: "  Sprint planning  ",
  description: "Plan the next sprint",
  location: "Room 4",
  organizerName: "Ann",
  slots: [slot("2026-12-01T03:00:00.000Z", "2026-12-01T04:00:00.000Z")],
};

describe("validateCreatePoll", () => {
  it("accepts a valid poll and trims text", () => {
    const r = validateCreatePoll(validPoll);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.title).toBe("Sprint planning");
    expect(r.value.organizerName).toBe("Ann");
    expect(r.value.slots[0].startAt).toEqual(new Date("2026-12-01T03:00:00.000Z"));
  });

  it("turns blank or missing optional fields into null", () => {
    const r = validateCreatePoll({ ...validPoll, description: "   ", location: undefined });
    expect(r.ok && r.value.description).toBeNull();
    expect(r.ok && r.value.location).toBeNull();
  });

  it("requires a title and organizer name", () => {
    const r = validateCreatePoll({ ...validPoll, title: " ", organizerName: undefined });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.title).toBe("Title is required.");
    expect(r.errors.organizerName).toBe("Your name is required.");
  });

  it("rejects text over the length limits", () => {
    const r = validateCreatePoll({
      ...validPoll,
      title: "x".repeat(LIMITS.title + 1),
      description: "x".repeat(LIMITS.description + 1),
      location: "x".repeat(LIMITS.location + 1),
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual(["description", "location", "title"]);
  });

  it("rejects a non-text description", () => {
    const r = validateCreatePoll({ ...validPoll, description: 42 });
    expect(!r.ok && r.errors.description).toBe("Description must be text.");
  });

  it("requires at least one slot", () => {
    for (const slots of [[], undefined, "nope"]) {
      const r = validateCreatePoll({ ...validPoll, slots });
      expect(!r.ok && r.errors.slots).toBe("Add at least one time slot.");
    }
  });

  it("rejects too many slots", () => {
    const many = Array.from({ length: LIMITS.maxSlots + 1 }, () => validPoll.slots[0]);
    const r = validateCreatePoll({ ...validPoll, slots: many });
    expect(!r.ok && r.errors.slots).toMatch(/no more than/);
  });

  it("rejects a slot whose end is not after its start", () => {
    const r = validateCreatePoll({
      ...validPoll,
      slots: [validPoll.slots[0], slot("2026-12-01T04:00:00Z", "2026-12-01T04:00:00Z")],
    });
    expect(!r.ok && r.errors["slots.1"]).toBe("End time must be after start time.");
  });

  it("rejects a slot with an invalid or missing date", () => {
    const r = validateCreatePoll({ ...validPoll, slots: [slot("not a date", ""), null] });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors["slots.0"]).toBe("Enter a date, start time and end time.");
    expect(r.errors["slots.1"]).toBe("Enter a date, start time and end time.");
  });

  it("handles a non-object body", () => {
    const r = validateCreatePoll(null);
    expect(r.ok).toBe(false);
  });
});

describe("validateVote", () => {
  const slotIds = ["s1", "s2"];
  const validVote = {
    participantName: " Bo ",
    choices: [
      { slotId: "s1", answer: "yes" },
      { slotId: "s2", answer: "no" },
    ],
  };

  it("accepts an answer for every slot and trims the name", () => {
    const r = validateVote(validVote, slotIds);
    expect(r).toEqual({ ok: true, value: { participantName: "Bo", choices: validVote.choices } });
  });

  it("requires a name", () => {
    const r = validateVote({ ...validVote, participantName: "" }, slotIds);
    expect(!r.ok && r.errors.participantName).toBe("Your name is required.");
  });

  it("requires an answer for every slot", () => {
    const r = validateVote({ ...validVote, choices: [validVote.choices[0]] }, slotIds);
    expect(!r.ok && r.errors.choices).toBe("Answer every time slot.");
  });

  it("requires choices to be a list", () => {
    const r = validateVote({ participantName: "Bo" }, slotIds);
    expect(!r.ok && r.errors.choices).toBe("Answer every time slot.");
  });

  it("rejects an unknown slot", () => {
    const r = validateVote({ ...validVote, choices: [...validVote.choices, { slotId: "s9", answer: "yes" }] }, slotIds);
    expect(!r.ok && r.errors.choices).toMatch(/not in this poll/);
  });

  it("rejects a slot answered twice", () => {
    const r = validateVote({ ...validVote, choices: [validVote.choices[0], validVote.choices[0]] }, slotIds);
    expect(!r.ok && r.errors.choices).toMatch(/only be answered once/);
  });

  it("rejects an answer other than yes or no", () => {
    const r = validateVote({ ...validVote, choices: [{ slotId: "s1", answer: "maybe" }, validVote.choices[1]] }, slotIds);
    expect(!r.ok && r.errors.choices).toBe("Each answer must be yes or no.");
  });
});
