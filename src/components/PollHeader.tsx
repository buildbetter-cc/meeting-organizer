import type { PublicPoll } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";

export function PollHeader({ poll, eyebrow }: { poll: PublicPoll; eyebrow: string }) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading as="h1" eyebrow={eyebrow} title={poll.title} lead={poll.description ?? undefined} />
      <p className="m-0 text-body text-ink-muted">
        Organized by <span className="text-ink">{poll.organizerName}</span>
        {poll.location && (
          <>
            {" · "}
            <span className="text-ink">{poll.location}</span>
          </>
        )}
      </p>
    </div>
  );
}
