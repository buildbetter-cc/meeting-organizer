import { ServiceError } from "./errors";
import { generateToken, tokensMatch } from "./tokens";
import type { PollRecord, PollRepository, PublicPoll } from "./types";
import { validateCreatePoll, validateVote } from "./validation";

export function toPublicPoll(poll: PollRecord): PublicPoll {
  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    location: poll.location,
    organizerName: poll.organizerName,
    status: poll.status,
    finalSlotId: poll.finalSlotId,
    createdAt: poll.createdAt.toISOString(),
    slots: [...poll.slots]
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      .map((s) => ({ id: s.id, startAt: s.startAt.toISOString(), endAt: s.endAt.toISOString() })),
    votes: [...poll.votes]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((v) => ({ id: v.id, participantName: v.participantName, choices: v.choices })),
  };
}

export function createPollService(repo: PollRepository, newToken: () => string = generateToken) {
  async function loadPoll(id: string): Promise<PollRecord> {
    const poll = await repo.findPollById(id);
    if (!poll) throw new ServiceError("not_found", "Poll not found.");
    return poll;
  }

  function assertAdmin(poll: PollRecord, adminToken: unknown) {
    if (typeof adminToken !== "string" || !tokensMatch(poll.adminToken, adminToken)) {
      throw new ServiceError("forbidden", "This admin link is not valid.");
    }
  }

  function assertOpen(poll: PollRecord) {
    if (poll.status === "closed") throw new ServiceError("closed", "This poll is closed.");
  }

  return {
    async createPoll(input: unknown): Promise<{ pollId: string; adminToken: string }> {
      const result = validateCreatePoll(input);
      if (!result.ok) throw new ServiceError("validation", "Check the highlighted fields.", result.errors);
      const adminToken = newToken();
      const { id } = await repo.insertPoll({ ...result.value, adminToken });
      return { pollId: id, adminToken };
    },

    async getPublicPoll(id: string): Promise<PublicPoll> {
      return toPublicPoll(await loadPoll(id));
    },

    async getAdminPoll(id: string, adminToken: string): Promise<PublicPoll> {
      const poll = await loadPoll(id);
      assertAdmin(poll, adminToken);
      return toPublicPoll(poll);
    },

    async castVote(pollId: string, input: unknown): Promise<{ voteId: string; editToken: string }> {
      const poll = await loadPoll(pollId);
      assertOpen(poll);
      const result = validateVote(input, poll.slots.map((s) => s.id));
      if (!result.ok) throw new ServiceError("validation", "Check the highlighted fields.", result.errors);
      const editToken = newToken();
      const { id } = await repo.insertVote(pollId, { ...result.value, editToken });
      return { voteId: id, editToken };
    },

    async updateVote(voteId: string, input: unknown): Promise<void> {
      const vote = await repo.findVoteById(voteId);
      if (!vote) throw new ServiceError("not_found", "Vote not found.");
      const editToken = (input as { editToken?: unknown } | null)?.editToken;
      if (typeof editToken !== "string" || !tokensMatch(vote.editToken, editToken)) {
        throw new ServiceError("forbidden", "You can only edit your own vote.");
      }
      const poll = await loadPoll(vote.pollId);
      assertOpen(poll);
      const result = validateVote(input, poll.slots.map((s) => s.id));
      if (!result.ok) throw new ServiceError("validation", "Check the highlighted fields.", result.errors);
      await repo.updateVote(voteId, result.value);
    },

    async finalizePoll(pollId: string, input: unknown): Promise<void> {
      const poll = await loadPoll(pollId);
      const body = (input ?? {}) as { adminToken?: unknown; slotId?: unknown };
      assertAdmin(poll, body.adminToken);
      assertOpen(poll);
      if (typeof body.slotId !== "string" || !poll.slots.some((s) => s.id === body.slotId)) {
        throw new ServiceError("validation", "Pick one of this poll's time slots.", {
          slotId: "Pick one of this poll's time slots.",
        });
      }
      await repo.closePoll(pollId, body.slotId);
    },
  };
}

export type PollService = ReturnType<typeof createPollService>;
