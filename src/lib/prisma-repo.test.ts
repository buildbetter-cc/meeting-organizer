// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createPrismaRepo, toPollRecord, toVoteRecord } from "./prisma-repo";

const date = new Date("2026-12-01T00:00:00Z");
const voteRow = {
  id: "v1", pollId: "p1", participantName: "Bo", editToken: "e", createdAt: date,
  choices: [{ voteId: "v1", slotId: "s1", answer: "yes" as const }],
};
const pollRow = {
  id: "p1", title: "T", description: null, location: "Room", organizerName: "Ann", adminToken: "a",
  status: "open" as const, finalSlotId: null, createdAt: date,
  slots: [{ id: "s1", pollId: "p1", startAt: date, endAt: date }],
  votes: [voteRow],
};

function fakeDb() {
  const db = {
    poll: { create: vi.fn(async () => ({ id: "p1" })), findUnique: vi.fn(), updateMany: vi.fn() },
    vote: { create: vi.fn(async () => ({ id: "v1" })), findUnique: vi.fn(), update: vi.fn(() => "update-op") },
    voteChoice: { deleteMany: vi.fn(() => "delete-op") },
    $transaction: vi.fn(async () => []),
  };
  return { db, repo: createPrismaRepo(db as unknown as PrismaClient) };
}

describe("row mapping", () => {
  it("maps a vote row to a vote record", () => {
    expect(toVoteRecord(voteRow)).toEqual({
      id: "v1", pollId: "p1", participantName: "Bo", editToken: "e", createdAt: date,
      choices: [{ slotId: "s1", answer: "yes" }],
    });
  });

  it("maps a poll row to a poll record", () => {
    const record = toPollRecord(pollRow);
    expect(record.slots).toEqual([{ id: "s1", startAt: date, endAt: date }]);
    expect(record.votes[0].choices).toEqual([{ slotId: "s1", answer: "yes" }]);
    expect(record.location).toBe("Room");
  });
});

describe("createPrismaRepo", () => {
  it("creates a poll with nested slots", async () => {
    const { db, repo } = fakeDb();
    const result = await repo.insertPoll({
      title: "T", description: null, location: null, organizerName: "Ann", adminToken: "a",
      slots: [{ startAt: date, endAt: date }],
    });
    expect(result).toEqual({ id: "p1" });
    expect(db.poll.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slots: { create: [{ startAt: date, endAt: date }] } }),
      }),
    );
  });

  it("finds a poll, or returns null", async () => {
    const { db, repo } = fakeDb();
    db.poll.findUnique.mockResolvedValueOnce(pollRow).mockResolvedValueOnce(null);
    expect((await repo.findPollById("p1"))?.id).toBe("p1");
    expect(await repo.findPollById("nope")).toBeNull();
  });

  it("creates a vote with nested choices", async () => {
    const { db, repo } = fakeDb();
    await repo.insertVote("p1", { participantName: "Bo", editToken: "e", choices: [{ slotId: "s1", answer: "no" }] });
    expect(db.vote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ pollId: "p1", choices: { create: [{ slotId: "s1", answer: "no" }] } }),
      }),
    );
  });

  it("finds a vote, or returns null", async () => {
    const { db, repo } = fakeDb();
    db.vote.findUnique.mockResolvedValueOnce(voteRow).mockResolvedValueOnce(null);
    expect((await repo.findVoteById("v1"))?.participantName).toBe("Bo");
    expect(await repo.findVoteById("nope")).toBeNull();
  });

  it("replaces a vote's choices in one transaction", async () => {
    const { db, repo } = fakeDb();
    await repo.updateVote("v1", { participantName: "Bob", choices: [{ slotId: "s1", answer: "yes" }] });
    expect(db.voteChoice.deleteMany).toHaveBeenCalledWith({ where: { voteId: "v1" } });
    expect(db.$transaction).toHaveBeenCalledWith(["delete-op", "update-op"]);
  });

  it("closes only an open poll", async () => {
    const { db, repo } = fakeDb();
    await repo.closePoll("p1", "s1");
    expect(db.poll.updateMany).toHaveBeenCalledWith({
      where: { id: "p1", status: "open" },
      data: { status: "closed", finalSlotId: "s1" },
    });
  });
});
