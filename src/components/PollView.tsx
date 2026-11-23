"use client";

import { useState } from "react";
import type { PublicPoll } from "@/lib/types";
import { useIsClient } from "@/lib/use-is-client";
import { loadMyVote, type StoredVote } from "@/lib/vote-storage";
import { ResultsGrid } from "./ResultsGrid";
import { VoteForm } from "./VoteForm";

/** The participant page body: results grid plus the vote form while the poll is open. */
export function PollView({ poll }: { poll: PublicPoll }) {
  const isClient = useIsClient();
  // undefined = not saved in this session yet; fall back to what this browser stored earlier.
  const [savedVote, setSavedVote] = useState<StoredVote | undefined>(undefined);
  const myVote = savedVote ?? (isClient ? loadMyVote(poll.id) : null);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4" aria-labelledby="results-heading">
        <h2 id="results-heading" className="m-0 font-display text-heading-3 text-ink">
          Who can make it
        </h2>
        <ResultsGrid poll={poll} myVoteId={myVote?.voteId} />
      </section>
      {poll.status === "open" && isClient && (
        <VoteForm key={myVote?.voteId ?? "new"} poll={poll} myVote={myVote} onSaved={setSavedVote} />
      )}
    </div>
  );
}
