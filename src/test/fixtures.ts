import type { PublicPoll } from "@/lib/types";

export function makePoll(overrides: Partial<PublicPoll> = {}): PublicPoll {
  return {
    id: "poll1",
    title: "Sprint planning",
    description: "Plan the next sprint",
    location: "Room 4",
    organizerName: "Ann",
    status: "open",
    finalSlotId: null,
    createdAt: "2026-11-20T00:00:00.000Z",
    slots: [
      { id: "s1", startAt: "2026-12-01T03:00:00.000Z", endAt: "2026-12-01T04:00:00.000Z" },
      { id: "s2", startAt: "2026-12-02T03:00:00.000Z", endAt: "2026-12-02T04:00:00.000Z" },
    ],
    votes: [
      { id: "v1", participantName: "Bo", choices: [{ slotId: "s1", answer: "yes" }, { slotId: "s2", answer: "no" }] },
      { id: "v2", participantName: "Cy", choices: [{ slotId: "s1", answer: "yes" }, { slotId: "s2", answer: "yes" }] },
    ],
    ...overrides,
  };
}
