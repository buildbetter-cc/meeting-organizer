import type { PublicPoll } from "@/lib/types";
import { Card } from "./Card";
import { SlotLabel } from "./SlotLabel";

/** Shows the chosen time once the organizer has closed the poll. */
export function FinalTime({ poll }: { poll: PublicPoll }) {
  const slot = poll.slots.find((s) => s.id === poll.finalSlotId);
  if (poll.status !== "closed" || !slot) return null;
  return (
    <Card>
      <p className="m-0 text-eyebrow uppercase text-accent">Final time</p>
      <SlotLabel startAt={slot.startAt} endAt={slot.endAt} size="lg" />
      <p className="m-0 text-body-sm text-ink-muted">
        This poll is closed{poll.location ? ` · ${poll.location}` : ""}.
      </p>
    </Card>
  );
}
