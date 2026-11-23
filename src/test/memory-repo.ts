import type { PollRecord, PollRepository, VoteRecord } from "@/lib/types";

/** In-memory PollRepository for unit tests. */
export function createMemoryRepo(): PollRepository & { polls: Map<string, PollRecord> } {
  const polls = new Map<string, PollRecord>();
  let seq = 0;
  let clock = Date.UTC(2026, 0, 1);
  const nextId = (prefix: string) => `${prefix}${++seq}`;
  const now = () => new Date((clock += 1000));
  const clone = <T>(v: T): T => structuredClone(v);

  function findVote(id: string): VoteRecord | undefined {
    for (const p of polls.values()) {
      const v = p.votes.find((x) => x.id === id);
      if (v) return v;
    }
    return undefined;
  }

  return {
    polls,
    async insertPoll(data) {
      const id = nextId("poll");
      polls.set(id, {
        id,
        title: data.title,
        description: data.description,
        location: data.location,
        organizerName: data.organizerName,
        adminToken: data.adminToken,
        status: "open",
        finalSlotId: null,
        createdAt: now(),
        slots: data.slots.map((s) => ({ id: nextId("slot"), startAt: s.startAt, endAt: s.endAt })),
        votes: [],
      });
      return { id };
    },
    async findPollById(id) {
      const p = polls.get(id);
      return p ? clone(p) : null;
    },
    async insertVote(pollId, data) {
      const id = nextId("vote");
      polls.get(pollId)!.votes.push({ id, pollId, createdAt: now(), ...clone(data) });
      return { id };
    },
    async findVoteById(id) {
      const v = findVote(id);
      return v ? clone(v) : null;
    },
    async updateVote(id, data) {
      const v = findVote(id)!;
      v.participantName = data.participantName;
      v.choices = clone(data.choices);
    },
    async closePoll(pollId, finalSlotId) {
      const p = polls.get(pollId)!;
      p.status = "closed";
      p.finalSlotId = finalSlotId;
    },
  };
}
