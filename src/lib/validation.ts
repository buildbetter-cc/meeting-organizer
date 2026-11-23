import type { AnswerValue, Choice } from "./types";
import type { FieldErrors } from "./errors";

export const LIMITS = {
  title: 200,
  description: 2000,
  location: 200,
  name: 100,
  maxSlots: 50,
} as const;

export interface CreatePollValues {
  title: string;
  description: string | null;
  location: string | null;
  organizerName: string;
  slots: { startAt: Date; endAt: Date }[];
}

export interface VoteValues {
  participantName: string;
  choices: Choice[];
}

export type Result<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function requiredText(v: unknown, max: number, label: string): { value?: string; error?: string } {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return { error: `${label} is required.` };
  if (s.length > max) return { error: `${label} must be ${max} characters or fewer.` };
  return { value: s };
}

function optionalText(v: unknown, max: number, label: string): { value: string | null; error?: string } {
  if (v === undefined || v === null) return { value: null };
  if (typeof v !== "string") return { value: null, error: `${label} must be text.` };
  const s = v.trim();
  if (s.length > max) return { value: null, error: `${label} must be ${max} characters or fewer.` };
  return { value: s || null };
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function validateCreatePoll(input: unknown): Result<CreatePollValues> {
  const errors: FieldErrors = {};
  const body = isRecord(input) ? input : {};

  const title = requiredText(body.title, LIMITS.title, "Title");
  if (title.error) errors.title = title.error;
  const organizerName = requiredText(body.organizerName, LIMITS.name, "Your name");
  if (organizerName.error) errors.organizerName = organizerName.error;
  const description = optionalText(body.description, LIMITS.description, "Description");
  if (description.error) errors.description = description.error;
  const location = optionalText(body.location, LIMITS.location, "Location");
  if (location.error) errors.location = location.error;

  const slots: { startAt: Date; endAt: Date }[] = [];
  const rawSlots = body.slots;
  if (!Array.isArray(rawSlots) || rawSlots.length === 0) {
    errors.slots = "Add at least one time slot.";
  } else if (rawSlots.length > LIMITS.maxSlots) {
    errors.slots = `Add no more than ${LIMITS.maxSlots} time slots.`;
  } else {
    rawSlots.forEach((raw, i) => {
      const slot = isRecord(raw) ? raw : {};
      const startAt = parseDate(slot.startAt);
      const endAt = parseDate(slot.endAt);
      if (!startAt || !endAt) {
        errors[`slots.${i}`] = "Enter a date, start time and end time.";
      } else if (endAt <= startAt) {
        errors[`slots.${i}`] = "End time must be after start time.";
      } else {
        slots.push({ startAt, endAt });
      }
    });
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      title: title.value!,
      description: description.value,
      location: location.value,
      organizerName: organizerName.value!,
      slots,
    },
  };
}

const ANSWERS: readonly AnswerValue[] = ["yes", "no"];

/** Validates a vote against the poll's slots: every slot must get exactly one answer. */
export function validateVote(input: unknown, slotIds: readonly string[]): Result<VoteValues> {
  const errors: FieldErrors = {};
  const body = isRecord(input) ? input : {};

  const name = requiredText(body.participantName, LIMITS.name, "Your name");
  if (name.error) errors.participantName = name.error;

  const choices: Choice[] = [];
  const rawChoices = body.choices;
  if (!Array.isArray(rawChoices)) {
    errors.choices = "Answer every time slot.";
  } else {
    const known = new Set(slotIds);
    const seen = new Set<string>();
    for (const raw of rawChoices) {
      const c = isRecord(raw) ? raw : {};
      const slotId = typeof c.slotId === "string" ? c.slotId : "";
      const answer = c.answer as AnswerValue;
      if (!known.has(slotId)) {
        errors.choices = "A choice refers to a time slot that is not in this poll.";
        break;
      }
      if (seen.has(slotId)) {
        errors.choices = "Each time slot can only be answered once.";
        break;
      }
      if (!ANSWERS.includes(answer)) {
        errors.choices = "Each answer must be yes or no.";
        break;
      }
      seen.add(slotId);
      choices.push({ slotId, answer });
    }
    if (!errors.choices && seen.size !== known.size) {
      errors.choices = "Answer every time slot.";
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { participantName: name.value!, choices } };
}
