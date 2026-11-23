export interface FormatOptions {
  locale?: string;
  timeZone?: string;
}

function dayKey(d: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone }).format(d);
}

/** Splits a time slot into a date line ("Tue, 1 Dec") and a time line ("10:00 – 11:00"). */
export function formatSlotParts(startIso: string, endIso: string, { locale, timeZone }: FormatOptions = {}) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateFmt = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone });
  const timeFmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone });
  const date = dateFmt.format(start);
  const sameDay = dayKey(start, timeZone) === dayKey(end, timeZone);
  const time = sameDay
    ? `${timeFmt.format(start)} – ${timeFmt.format(end)}`
    : `${timeFmt.format(start)} – ${dateFmt.format(end)}, ${timeFmt.format(end)}`;
  return { date, time };
}

/** Converts a local date ("2026-12-01") and time ("10:00") from form inputs into an ISO string, or "" if invalid. */
export function localToIso(date: string, time: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return "";
  const d = new Date(`${date}T${time}`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}
