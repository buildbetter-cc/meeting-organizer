"use client";

import { formatSlotParts } from "@/lib/format";
import { useIsClient } from "@/lib/use-is-client";

/**
 * A slot's date and time in the viewer's time zone. The server does not know
 * the viewer's zone, so it renders UTC until the page hydrates.
 */
export function SlotLabel({ startAt, endAt, size = "md" }: { startAt: string; endAt: string; size?: "md" | "lg" }) {
  const isClient = useIsClient();
  const { date, time } = formatSlotParts(startAt, endAt, isClient ? {} : { timeZone: "UTC" });
  const dateClass = size === "lg" ? "font-display text-heading-2 text-ink" : "font-semibold text-ink";
  const timeClass = size === "lg" ? "text-lead text-ink-muted" : "text-body-sm text-ink-muted";
  return (
    <span className="flex flex-col">
      <span className={dateClass}>{date}</span>
      <span className={timeClass}>
        {time}
        {!isClient && " UTC"}
      </span>
    </span>
  );
}
