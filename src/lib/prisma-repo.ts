import type { Prisma, PrismaClient } from "@prisma/client";
import type { Choice, PollRecord, PollRepository, VoteRecord } from "./types";

const pollInclude = {
  slots: true,
  votes: { include: { choices: true } },
} satisfies Prisma.PollInclude;

type PollRow = Prisma.PollGetPayload<{ include: typeof pollInclude }>;
type VoteRow = Prisma.VoteGetPayload<{ include: { choices: true } }>;

function toChoices(rows: VoteRow["choices"]): Choice[] {
  return rows.map((c) => ({ slotId: c.slotId, answer: c.answer }));
}

export function toVoteRecord(v: VoteRow): VoteRecord {
  return {
    id: v.id,
    pollId: v.pollId,
    participantName: v.participantName,
    editToken: v.editToken,
    createdAt: v.createdAt,
    choices: toChoices(v.choices),
  };
}

export function toPollRecord(p: PollRow): PollRecord {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    location: p.location,
    organizerName: p.organizerName,
    adminToken: p.adminToken,
    status: p.status,
    finalSlotId: p.finalSlotId,
    createdAt: p.createdAt,
    slots: p.slots.map((s) => ({ id: s.id, startAt: s.startAt, endAt: s.endAt })),
    votes: p.votes.map(toVoteRecord),
  };
}

export function createPrismaRepo(db: PrismaClient): PollRepository {
  return {
    async insertPoll(data) {
      return db.poll.create({
        data: {
          title: data.title,
          description: data.description,
          location: data.location,
          organizerName: data.organizerName,
          adminToken: data.adminToken,
          slots: { create: data.slots.map((s) => ({ startAt: s.startAt, endAt: s.endAt })) },
        },
        select: { id: true },
      });
    },

    async findPollById(id) {
      const row = await db.poll.findUnique({ where: { id }, include: pollInclude });
      return row ? toPollRecord(row) : null;
    },

    async insertVote(pollId, data) {
      return db.vote.create({
        data: {
          pollId,
          participantName: data.participantName,
          editToken: data.editToken,
          choices: { create: data.choices.map((c) => ({ slotId: c.slotId, answer: c.answer })) },
        },
        select: { id: true },
      });
    },

    async findVoteById(id) {
      const row = await db.vote.findUnique({ where: { id }, include: { choices: true } });
      return row ? toVoteRecord(row) : null;
    },

    async updateVote(id, data) {
      await db.$transaction([
        db.voteChoice.deleteMany({ where: { voteId: id } }),
        db.vote.update({
          where: { id },
          data: {
            participantName: data.participantName,
            choices: { create: data.choices.map((c) => ({ slotId: c.slotId, answer: c.answer })) },
          },
        }),
      ]);
    },

    async closePoll(pollId, finalSlotId) {
      await db.poll.updateMany({
        where: { id: pollId, status: "open" },
        data: { status: "closed", finalSlotId },
      });
    },
  };
}
