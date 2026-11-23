"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { sendJson } from "@/lib/api-client";
import { bestSlotIds, tallyYes } from "@/lib/results";
import type { PublicPoll } from "@/lib/types";
import { Button } from "./Button";
import { Card } from "./Card";
import { SlotLabel } from "./SlotLabel";

/** Lets the organizer pick the final slot and close the poll. Preselects the most available slot. */
export function FinalizeForm({ poll, adminToken }: { poll: PublicPoll; adminToken: string }) {
  const router = useRouter();
  const tally = tallyYes(poll.slots, poll.votes);
  const [slotId, setSlotId] = useState(() => bestSlotIds(tally)[0] ?? poll.slots[0]?.id ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await sendJson(`/api/polls/${poll.id}/finalize`, "POST", { adminToken, slotId });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Card title="Pick the final time">
      <form onSubmit={submit} className="flex flex-col gap-6">
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-3 text-body-sm text-ink-muted">
            Closing the poll stops new votes and shows the final time to everyone.
          </legend>
          {poll.slots.map((slot) => (
            <label key={slot.id} className="flex cursor-pointer items-center gap-4 rounded-md border border-line bg-surface p-4 has-[:checked]:border-accent">
              <input type="radio" name="finalSlot" className="h-5 w-5 shrink-0" value={slot.id}
                checked={slotId === slot.id} onChange={() => setSlotId(slot.id)} />
              <span className="flex-1"><SlotLabel startAt={slot.startAt} endAt={slot.endAt} /></span>
              <span className="text-body-sm text-ink-muted">{tally[slot.id]} available</span>
            </label>
          ))}
        </fieldset>
        {error && <p role="alert" className="m-0 text-body-sm text-danger">{error}</p>}
        <div>
          <Button type="submit" disabled={submitting || !slotId}>
            {submitting ? "Closing…" : "Confirm final time"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
