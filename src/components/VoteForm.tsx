"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, sendJson } from "@/lib/api-client";
import type { FieldErrors } from "@/lib/errors";
import type { PublicPoll } from "@/lib/types";
import { saveMyVote, type StoredVote } from "@/lib/vote-storage";
import { Button } from "./Button";
import { Card } from "./Card";
import { Field, inputBorder, inputClass } from "./Field";
import { SlotLabel } from "./SlotLabel";

type Props = {
  poll: PublicPoll;
  myVote: StoredVote | null;
  onSaved: (vote: StoredVote) => void;
};

/** Name plus one "available" checkbox per slot. Creates a vote, or edits this browser's earlier vote. */
export function VoteForm({ poll, myVote, onSaved }: Props) {
  const router = useRouter();
  const existing = myVote ? poll.votes.find((v) => v.id === myVote.voteId) : undefined;
  const [name, setName] = useState(existing?.participantName ?? "");
  const [available, setAvailable] = useState<Set<string>>(
    () => new Set(existing?.choices.filter((c) => c.answer === "yes").map((c) => c.slotId)),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function toggle(slotId: string, on: boolean) {
    setSaved(false);
    setAvailable((prev) => {
      const next = new Set(prev);
      if (on) next.add(slotId);
      else next.delete(slotId);
      return next;
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError("");
    setSaved(false);
    if (!name.trim()) {
      setErrors({ participantName: "Your name is required." });
      return;
    }
    const body = {
      participantName: name,
      choices: poll.slots.map((s) => ({ slotId: s.id, answer: available.has(s.id) ? "yes" : "no" })),
    };
    setSubmitting(true);
    try {
      if (existing && myVote) {
        await sendJson(`/api/votes/${myVote.voteId}`, "PUT", { ...body, editToken: myVote.editToken });
        onSaved(myVote);
      } else {
        const vote = await sendJson<StoredVote>(`/api/polls/${poll.id}/votes`, "POST", body);
        saveMyVote(poll.id, vote);
        onSaved(vote);
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields);
        setFormError(Object.keys(err.fields).length ? "" : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title={existing ? "Edit your availability" : "Add your availability"}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <Field id="participantName" label="Your name" error={errors.participantName}>
          <input
            id="participantName"
            className={`${inputClass} ${inputBorder(errors.participantName)}`}
            value={name}
            maxLength={100}
            autoComplete="name"
            aria-invalid={Boolean(errors.participantName)}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </Field>

        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-3 text-label text-ink">Tick every time you can make</legend>
          {poll.slots.map((slot) => (
            <label
              key={slot.id}
              className="flex cursor-pointer items-center gap-4 rounded-md border border-line bg-surface p-4 has-[:checked]:border-accent"
            >
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0"
                checked={available.has(slot.id)}
                onChange={(e) => toggle(slot.id, e.target.checked)}
              />
              <SlotLabel startAt={slot.startAt} endAt={slot.endAt} />
            </label>
          ))}
          {errors.choices && (
            <p role="alert" className="m-0 text-body-sm text-danger">
              {errors.choices}
            </p>
          )}
        </fieldset>

        {formError && (
          <p role="alert" className="m-0 text-body-sm text-danger">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : existing ? "Update my availability" : "Save my availability"}
          </Button>
          {saved && (
            <p role="status" className="m-0 text-body-sm text-ink-muted">
              Saved. You can come back to this page to change it.
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
