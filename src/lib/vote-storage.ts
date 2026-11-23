export interface StoredVote {
  voteId: string;
  editToken: string;
}

const key = (pollId: string) => `bettermeet:vote:${pollId}`;

/** The vote this browser cast in a poll, if any. Never throws. */
export function loadMyVote(pollId: string): StoredVote | null {
  try {
    const raw = window.localStorage.getItem(key(pollId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredVote>;
    if (typeof parsed.voteId === "string" && typeof parsed.editToken === "string") {
      return { voteId: parsed.voteId, editToken: parsed.editToken };
    }
    return null;
  } catch {
    return null;
  }
}

/** Remembers this browser's vote so it can be edited later. Returns false if storage is unavailable. */
export function saveMyVote(pollId: string, vote: StoredVote): boolean {
  try {
    window.localStorage.setItem(key(pollId), JSON.stringify(vote));
    return true;
  } catch {
    return false;
  }
}
