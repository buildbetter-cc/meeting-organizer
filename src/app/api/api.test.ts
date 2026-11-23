// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPollService, type PollService } from "@/lib/poll-service";
import { createMemoryRepo } from "@/test/memory-repo";

const holder = vi.hoisted(() => ({ service: undefined as unknown as PollService }));
vi.mock("@/lib/service", () => ({ getPollService: () => holder.service }));

import { POST as createPoll } from "./polls/route";
import { GET as getPoll } from "./polls/[id]/route";
import { POST as castVote } from "./polls/[id]/votes/route";
import { POST as finalize } from "./polls/[id]/finalize/route";
import { PUT as updateVote } from "./votes/[voteId]/route";

const json = (body: unknown, method = "POST") =>
  new Request("http://localhost/api", { method, body: typeof body === "string" ? body : JSON.stringify(body) });
const getReq = () => new Request("http://localhost/api");
const params = <T>(p: T) => ({ params: Promise.resolve(p) });

const pollBody = {
  title: "Retro",
  organizerName: "Ann",
  slots: [{ startAt: "2026-12-01T03:00:00Z", endAt: "2026-12-01T04:00:00Z" }],
};

async function newPoll() {
  const res = await createPoll(json(pollBody));
  const { pollId, adminToken } = await res.json();
  const poll = await (await getPoll(getReq(), params({ id: pollId }))).json();
  return { pollId, adminToken, slotId: poll.slots[0].id as string };
}

beforeEach(() => {
  holder.service = createPollService(createMemoryRepo());
});

describe("POST /api/polls", () => {
  it("creates a poll and returns 201", async () => {
    const res = await createPoll(json(pollBody));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ pollId: expect.any(String), adminToken: expect.any(String) });
  });

  it("returns 400 with field errors for invalid input", async () => {
    const res = await createPoll(json({ ...pollBody, slots: [] }));
    expect(res.status).toBe(400);
    expect((await res.json()).fields).toEqual({ slots: "Add at least one time slot." });
  });

  it("returns 400 for malformed JSON", async () => {
    expect((await createPoll(json("{"))).status).toBe(400);
  });
});

describe("GET /api/polls/:id", () => {
  it("returns the public poll", async () => {
    const { pollId } = await newPoll();
    const res = await getPoll(getReq(), params({ id: pollId }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Retro");
    expect(body).not.toHaveProperty("adminToken");
  });

  it("returns 404 for an unknown poll", async () => {
    expect((await getPoll(getReq(), params({ id: "nope" }))).status).toBe(404);
  });
});

describe("POST /api/polls/:id/votes and PUT /api/votes/:voteId", () => {
  it("casts and then edits a vote", async () => {
    const { pollId, slotId } = await newPoll();
    const cast = await castVote(json({ participantName: "Bo", choices: [{ slotId, answer: "no" }] }), params({ id: pollId }));
    expect(cast.status).toBe(201);
    const { voteId, editToken } = await cast.json();

    const edit = await updateVote(
      json({ editToken, participantName: "Bo", choices: [{ slotId, answer: "yes" }] }, "PUT"),
      params({ voteId }),
    );
    expect(edit.status).toBe(200);
    const poll = await (await getPoll(getReq(), params({ id: pollId }))).json();
    expect(poll.votes[0].choices).toEqual([{ slotId, answer: "yes" }]);
  });

  it("returns 403 when editing with the wrong token", async () => {
    const { pollId, slotId } = await newPoll();
    const choices = [{ slotId, answer: "no" }];
    const { voteId } = await (await castVote(json({ participantName: "Bo", choices }), params({ id: pollId }))).json();
    const res = await updateVote(json({ editToken: "wrong", participantName: "Bo", choices }, "PUT"), params({ voteId }));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/polls/:id/finalize", () => {
  it("closes the poll, after which votes get 409", async () => {
    const { pollId, adminToken, slotId } = await newPoll();
    const res = await finalize(json({ adminToken, slotId }), params({ id: pollId }));
    expect(res.status).toBe(200);
    const vote = await castVote(json({ participantName: "Bo", choices: [{ slotId, answer: "yes" }] }), params({ id: pollId }));
    expect(vote.status).toBe(409);
  });

  it("returns 403 for the wrong admin token", async () => {
    const { pollId, slotId } = await newPoll();
    expect((await finalize(json({ adminToken: "wrong", slotId }), params({ id: pollId }))).status).toBe(403);
  });
});
