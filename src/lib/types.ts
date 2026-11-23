export type AnswerValue = "yes" | "no";
export type PollStatusValue = "open" | "closed";

export interface Choice {
  slotId: string;
  answer: AnswerValue;
}

export interface SlotRecord {
  id: string;
  startAt: Date;
  endAt: Date;
}

export interface VoteRecord {
  id: string;
  pollId: string;
  participantName: string;
  editToken: string;
  createdAt: Date;
  choices: Choice[];
}

export interface PollRecord {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  organizerName: string;
  adminToken: string;
  status: PollStatusValue;
  finalSlotId: string | null;
  createdAt: Date;
  slots: SlotRecord[];
  votes: VoteRecord[];
}

/** A poll as anyone with the participant link may see it: no tokens, ISO date strings. */
export interface PublicPoll {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  organizerName: string;
  status: PollStatusValue;
  finalSlotId: string | null;
  createdAt: string;
  slots: { id: string; startAt: string; endAt: string }[];
  votes: { id: string; participantName: string; choices: Choice[] }[];
}

export interface NewPollData {
  title: string;
  description: string | null;
  location: string | null;
  organizerName: string;
  adminToken: string;
  slots: { startAt: Date; endAt: Date }[];
}

export interface NewVoteData {
  participantName: string;
  editToken: string;
  choices: Choice[];
}

/** Storage used by the poll service. Implemented with Prisma in production and in memory in tests. */
export interface PollRepository {
  insertPoll(data: NewPollData): Promise<{ id: string }>;
  findPollById(id: string): Promise<PollRecord | null>;
  insertVote(pollId: string, data: NewVoteData): Promise<{ id: string }>;
  findVoteById(id: string): Promise<VoteRecord | null>;
  updateVote(id: string, data: { participantName: string; choices: Choice[] }): Promise<void>;
  closePoll(pollId: string, finalSlotId: string): Promise<void>;
}
