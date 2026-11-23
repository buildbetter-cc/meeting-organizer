import type { Metadata } from "next";
import { FinalTime } from "@/components/FinalTime";
import { FinalizeForm } from "@/components/FinalizeForm";
import { PollHeader } from "@/components/PollHeader";
import { ResultsGrid } from "@/components/ResultsGrid";
import { ShareLinks } from "@/components/ShareLinks";
import { loadOr404 } from "@/lib/load-poll";
import { getPollService } from "@/lib/service";

type Props = {
  params: Promise<{ id: string; token: string }>;
  searchParams: Promise<{ created?: string }>;
};

export const metadata: Metadata = {
  title: "Manage poll · BetterMeet",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function AdminPage({ params, searchParams }: Props) {
  const { id, token } = await params;
  const { created } = await searchParams;
  const poll = await loadOr404(() => getPollService().getAdminPoll(id, token));
  return (
    <div className="flex flex-col gap-12">
      {created === "1" && (
        <p role="status" className="m-0 rounded-md border border-accent bg-accent-soft p-4 text-ink">
          Your poll is ready. Copy the participant link below and send it to everyone, then save your admin link.
        </p>
      )}
      <PollHeader poll={poll} eyebrow="Manage poll" />
      <FinalTime poll={poll} />
      <ShareLinks pollId={poll.id} adminToken={token} />
      <section className="flex flex-col gap-4" aria-labelledby="results-heading">
        <h2 id="results-heading" className="m-0 font-display text-heading-3 text-ink">
          Who can make it
        </h2>
        <ResultsGrid poll={poll} />
      </section>
      {poll.status === "open" && <FinalizeForm poll={poll} adminToken={token} />}
    </div>
  );
}
