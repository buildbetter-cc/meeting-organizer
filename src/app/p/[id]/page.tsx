import type { Metadata } from "next";
import { FinalTime } from "@/components/FinalTime";
import { PollHeader } from "@/components/PollHeader";
import { PollView } from "@/components/PollView";
import { loadOr404 } from "@/lib/load-poll";
import { getPollService } from "@/lib/service";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const poll = await loadOr404(() => getPollService().getPublicPoll(id));
  return { title: `${poll.title} · BetterMeet` };
}

export default async function PollPage({ params }: Props) {
  const { id } = await params;
  const poll = await loadOr404(() => getPollService().getPublicPoll(id));
  return (
    <div className="flex flex-col gap-12">
      <PollHeader poll={poll} eyebrow={poll.status === "closed" ? "Closed poll" : "Meeting poll"} />
      <FinalTime poll={poll} />
      <PollView poll={poll} />
    </div>
  );
}
