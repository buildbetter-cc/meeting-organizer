// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryRepo } from "@/test/memory-repo";
import { ServiceError } from "./errors";
import { createPollService, toPublicPoll } from "./poll-service";

const pollInput = {
  title: "Team lunch",
  organizerName: "Ann",
  slots: [
    { startAt: "2026-12-02T05:00:00Z", endAt: "2026-12-02T06:00:00Z" },
    { startAt: "2026-12-01T05:00:00Z", endAt: "2026-12-01T06:00:00Z" },
  ],
};

function setup() {
  const repo = createMemoryRepo();
  let n = 0;
  const service = createPollService(repo, () => `token-${++n}`);
  return { repo, service };
}

async function expectCode(promise: Promise<unknown>, code: ServiceError["code"]) {
  await expect(promise).rejects.toMatchObject({ name: "ServiceError", code });
}

describe("poll service", () => {
  let repo: ReturnType<typeof setup>["repo"];
  let service: ReturnType<typeof setup>["service"];
  let pollId: string;
  let adminToken: string;
  let slotIds: string[];

  beforeEach(async () => {
    ({ repo, service } = setup());
    ({ pollId, adminToken } = await service.createPoll(pollInput));
    slotIds = (await service.getPublicPoll(pollId)).slots.map((s) => s.id);
  });

  const voteFor = (name: string, yes: string[]) => ({
    participantName: name,
    choices: slotIds.map((slotId) => ({ slotId, answer: yes.includes(slotId) ? "yes" : "no" })),
  });

  describe("createPoll", () => {
    it("stores the poll and returns its id and admin token", async () => {
      expect(adminToken).toBe("token-1");
      const stored = repo.polls.get(pollId)!;
      expect(stored.title).toBe("Team lunch");
      expect(stored.adminToken).toBe("token-1");
      expect(stored.status).toBe("open");
      expect(stored.slots).toHaveLength(2);
    });

    it("rejects invalid input with field errors", async () => {
      await expect(service.createPoll({ ...pollInput, title: "" })).rejects.toMatchObject({
        code: "validation",
        fields: { title: "Title is required." },
      });
    });
  });

  describe("getPublicPoll", () => {
    it("hides the admin token and edit tokens, and sorts slots by start time", async () => {
      await service.castVote(pollId, voteFor("Bo", []));
      const poll = await service.getPublicPoll(pollId);
      expect(JSON.stringify(poll)).not.toContain("token-");
      expect(poll.slots.map((s) => s.startAt)).toEqual(["2026-12-01T05:00:00.000Z", "2026-12-02T05:00:00.000Z"]);
      expect(poll.votes).toEqual([{ id: expect.any(String), participantName: "Bo", choices: expect.any(Array) }]);
    });

    it("throws not_found for an unknown poll", async () => {
      await expectCode(service.getPublicPoll("nope"), "not_found");
    });
  });

  describe("getAdminPoll", () => {
    it("returns the poll for the right admin token", async () => {
      expect((await service.getAdminPoll(pollId, adminToken)).id).toBe(pollId);
    });

    it("throws forbidden for a wrong admin token", async () => {
      await expectCode(service.getAdminPoll(pollId, "wrong"), "forbidden");
    });
  });

  describe("castVote", () => {
    it("stores the vote and returns an edit token", async () => {
      const { voteId, editToken } = await service.castVote(pollId, voteFor("Bo", [slotIds[0]]));
      expect(editToken).toBe("token-2");
      const stored = await repo.findVoteById(voteId);
      expect(stored).toMatchObject({ participantName: "Bo", editToken: "token-2" });
    });

    it("rejects a vote that misses a slot", async () => {
      const input = { participantName: "Bo", choices: [{ slotId: slotIds[0], answer: "yes" }] };
      await expectCode(service.castVote(pollId, input), "validation");
    });

    it("rejects votes on a closed poll", async () => {
      await service.finalizePoll(pollId, { adminToken, slotId: slotIds[0] });
      await expectCode(service.castVote(pollId, voteFor("Bo", [])), "closed");
    });

    it("throws not_found for an unknown poll", async () => {
      await expectCode(service.castVote("nope", voteFor("Bo", [])), "not_found");
    });
  });

  describe("updateVote", () => {
    it("updates the name and answers with the right edit token", async () => {
      const { voteId, editToken } = await service.castVote(pollId, voteFor("Bo", []));
      await service.updateVote(voteId, { editToken, ...voteFor("Bob", slotIds) });
      const stored = await repo.findVoteById(voteId);
      expect(stored?.participantName).toBe("Bob");
      expect(stored?.choices.every((c) => c.answer === "yes")).toBe(true);
    });

    it("throws forbidden for a wrong or missing edit token", async () => {
      const { voteId } = await service.castVote(pollId, voteFor("Bo", []));
      await expectCode(service.updateVote(voteId, { editToken: "wrong", ...voteFor("Bo", []) }), "forbidden");
      await expectCode(service.updateVote(voteId, voteFor("Bo", [])), "forbidden");
    });

    it("throws not_found for an unknown vote", async () => {
      await expectCode(service.updateVote("nope", { editToken: "x" }), "not_found");
    });

    it("rejects edits on a closed poll", async () => {
      const { voteId, editToken } = await service.castVote(pollId, voteFor("Bo", []));
      await service.finalizePoll(pollId, { adminToken, slotId: slotIds[0] });
      await expectCode(service.updateVote(voteId, { editToken, ...voteFor("Bo", []) }), "closed");
    });

    it("rejects an invalid edit", async () => {
      const { voteId, editToken } = await service.castVote(pollId, voteFor("Bo", []));
      await expectCode(service.updateVote(voteId, { editToken, participantName: "", choices: [] }), "validation");
    });
  });

  describe("finalizePoll", () => {
    it("closes the poll with the chosen slot", async () => {
      await service.finalizePoll(pollId, { adminToken, slotId: slotIds[1] });
      const poll = await service.getPublicPoll(pollId);
      expect(poll.status).toBe("closed");
      expect(poll.finalSlotId).toBe(slotIds[1]);
    });

    it("throws forbidden for a wrong admin token", async () => {
      await expectCode(service.finalizePoll(pollId, { adminToken: "wrong", slotId: slotIds[0] }), "forbidden");
      await expectCode(service.finalizePoll(pollId, null), "forbidden");
    });

    it("rejects a slot from outside the poll", async () => {
      await expectCode(service.finalizePoll(pollId, { adminToken, slotId: "other" }), "validation");
    });

    it("rejects finalizing twice", async () => {
      await service.finalizePoll(pollId, { adminToken, slotId: slotIds[0] });
      await expectCode(service.finalizePoll(pollId, { adminToken, slotId: slotIds[1] }), "closed");
    });
  });
});

describe("toPublicPoll", () => {
  it("orders votes by creation time", () => {
    const base = {
      id: "p", title: "t", description: null, location: null, organizerName: "o", adminToken: "secret",
      status: "open" as const, finalSlotId: null, createdAt: new Date(0), slots: [],
    };
    const vote = (id: string, t: number) => ({
      id, pollId: "p", participantName: id, editToken: "e", createdAt: new Date(t), choices: [],
    });
    const poll = toPublicPoll({ ...base, votes: [vote("late", 2000), vote("early", 1000)] });
    expect(poll.votes.map((v) => v.id)).toEqual(["early", "late"]);
  });
});
