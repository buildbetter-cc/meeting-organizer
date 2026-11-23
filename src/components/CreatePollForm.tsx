"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { ApiError, sendJson } from "@/lib/api-client";
import type { FieldErrors } from "@/lib/errors";
import { localToIso } from "@/lib/format";
import { LIMITS, validateCreatePoll } from "@/lib/validation";
import { Button } from "./Button";
import { Card } from "./Card";
import { Field, inputBorder, inputClass } from "./Field";

interface SlotDraft {
  key: number;
  date: string;
  start: string;
  end: string;
}

/** Form for a new poll: details, the organizer's name and one or more candidate time slots. */
export function CreatePollForm() {
  const router = useRouter();
  const nextKey = useRef(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [slots, setSlots] = useState<SlotDraft[]>([{ key: 0, date: "", start: "09:00", end: "10:00" }]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateSlot(key: number, patch: Partial<SlotDraft>) {
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function addSlot() {
    setSlots((prev) => {
      const last = prev[prev.length - 1];
      return [...prev, { key: nextKey.current++, date: last?.date ?? "", start: last?.start ?? "09:00", end: last?.end ?? "10:00" }];
    });
  }

  function removeSlot(key: number) {
    setSlots((prev) => prev.filter((s) => s.key !== key));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const body = {
      title,
      description,
      location,
      organizerName,
      slots: slots.map((s) => ({ startAt: localToIso(s.date, s.start), endAt: localToIso(s.date, s.end) })),
    };
    const check = validateCreatePoll(body);
    if (!check.ok) {
      setErrors(check.errors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const { pollId, adminToken } = await sendJson<{ pollId: string; adminToken: string }>("/api/polls", "POST", body);
      router.push(`/p/${pollId}/admin/${adminToken}?created=1`);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields);
      else setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <Card title="Meeting details">
        <Field id="title" label="Title" error={errors.title}>
          <input id="title" className={`${inputClass} ${inputBorder(errors.title)}`} value={title} maxLength={LIMITS.title}
            placeholder="Sprint planning" aria-invalid={Boolean(errors.title)} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field id="description" label="Description" optional error={errors.description}>
          <textarea id="description" rows={3} className={`${inputClass} h-auto py-2 ${inputBorder(errors.description)}`}
            value={description} maxLength={LIMITS.description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field id="location" label="Location" optional hint="A room, an address or a video call link." error={errors.location}>
          <input id="location" className={`${inputClass} ${inputBorder(errors.location)}`} value={location}
            maxLength={LIMITS.location} onChange={(e) => setLocation(e.target.value)} />
        </Field>
        <Field id="organizerName" label="Your name" error={errors.organizerName}>
          <input id="organizerName" className={`${inputClass} ${inputBorder(errors.organizerName)}`} value={organizerName}
            maxLength={LIMITS.name} autoComplete="name" aria-invalid={Boolean(errors.organizerName)}
            onChange={(e) => setOrganizerName(e.target.value)} />
        </Field>
      </Card>

      <Card title="Time options">
        <p className="m-0 text-body-sm text-ink-muted">Times are in your local time zone. Participants see them in theirs.</p>
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {slots.map((slot, i) => {
            const error = errors[`slots.${i}`];
            return (
              <li key={slot.key} className="flex flex-col gap-2 rounded-md border border-line bg-surface p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <label className="flex flex-col gap-1 text-body-sm text-ink-muted">
                    Date
                    <input type="date" aria-label={`Option ${i + 1} date`} className={`${inputClass} w-44 ${inputBorder(error)}`}
                      value={slot.date} onChange={(e) => updateSlot(slot.key, { date: e.target.value })} />
                  </label>
                  <label className="flex flex-col gap-1 text-body-sm text-ink-muted">
                    Start
                    <input type="time" aria-label={`Option ${i + 1} start`} className={`${inputClass} w-32 ${inputBorder(error)}`}
                      value={slot.start} onChange={(e) => updateSlot(slot.key, { start: e.target.value })} />
                  </label>
                  <label className="flex flex-col gap-1 text-body-sm text-ink-muted">
                    End
                    <input type="time" aria-label={`Option ${i + 1} end`} className={`${inputClass} w-32 ${inputBorder(error)}`}
                      value={slot.end} onChange={(e) => updateSlot(slot.key, { end: e.target.value })} />
                  </label>
                  {slots.length > 1 && (
                    <Button variant="ghost" onClick={() => removeSlot(slot.key)} aria-label={`Remove option ${i + 1}`}>
                      Remove
                    </Button>
                  )}
                </div>
                {error && <p role="alert" className="m-0 text-body-sm text-danger">{error}</p>}
              </li>
            );
          })}
        </ol>
        {errors.slots && <p role="alert" className="m-0 text-body-sm text-danger">{errors.slots}</p>}
        <div>
          <Button variant="secondary" onClick={addSlot} disabled={slots.length >= LIMITS.maxSlots}>
            Add another time
          </Button>
        </div>
      </Card>

      {formError && <p role="alert" className="m-0 text-body-sm text-danger">{formError}</p>}
      <div>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Creating…" : "Create poll"}
        </Button>
      </div>
    </form>
  );
}
