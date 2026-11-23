import { bestSlotIds, tallyYes } from "@/lib/results";
import type { PublicPoll } from "@/lib/types";
import { Pill } from "./Pill";
import { SlotLabel } from "./SlotLabel";

function YesMark() {
  return (
    <>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto h-5 w-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
      <span className="sr-only">Yes</span>
    </>
  );
}

function NoMark() {
  return (
    <>
      <span aria-hidden="true" className="text-ink-muted">–</span>
      <span className="sr-only">No</span>
    </>
  );
}

/** Participants as rows, slots as columns, with a yes count per slot. */
export function ResultsGrid({ poll, myVoteId }: { poll: PublicPoll; myVoteId?: string | null }) {
  const tally = tallyYes(poll.slots, poll.votes);
  const best = new Set(poll.status === "closed" ? [] : bestSlotIds(tally));
  const highlight = (slotId: string) => slotId === poll.finalSlotId || best.has(slotId);

  if (poll.votes.length === 0) {
    return (
      <p className="m-0 rounded-lg border border-dashed border-line p-6 text-ink-muted">
        No votes yet. Share the participant link to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Availability for {poll.title}</caption>
        <thead>
          <tr className="border-b border-line bg-surface-sunken">
            <th scope="col" className="min-w-40 p-4 text-label text-ink-muted">
              Participant
            </th>
            {poll.slots.map((slot) => (
              <th key={slot.id} scope="col" className={`min-w-36 p-4 align-top font-normal ${highlight(slot.id) ? "bg-accent-soft" : ""}`}>
                <div className="flex flex-col gap-2">
                  <SlotLabel startAt={slot.startAt} endAt={slot.endAt} />
                  {slot.id === poll.finalSlotId && <Pill tone="accent">Final time</Pill>}
                  {best.has(slot.id) && <Pill tone="accent">Most available</Pill>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {poll.votes.map((vote) => {
            const answers = new Map(vote.choices.map((c) => [c.slotId, c.answer]));
            return (
              <tr key={vote.id} className="border-b border-line last:border-b-0">
                <th scope="row" className="p-4 font-normal text-ink">
                  <span className="flex flex-wrap items-center gap-2">
                    {vote.participantName}
                    {vote.id === myVoteId && <Pill>You</Pill>}
                  </span>
                </th>
                {poll.slots.map((slot) => (
                  <td key={slot.id} className={`p-4 text-center ${highlight(slot.id) ? "bg-accent-soft/50" : ""}`}>
                    {answers.get(slot.id) === "yes" ? <YesMark /> : <NoMark />}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-line-strong bg-surface-sunken">
            <th scope="row" className="p-4 text-label text-ink-muted">
              Available
            </th>
            {poll.slots.map((slot) => (
              <td
                key={slot.id}
                data-testid={`count-${slot.id}`}
                className={`p-4 text-center font-display text-heading-3 ${highlight(slot.id) ? "text-accent" : "text-ink"}`}
              >
                {tally[slot.id]}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
