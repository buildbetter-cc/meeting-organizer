import type { ReactNode } from "react";

/** Short, non-interactive label. */
export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "accent"; children: ReactNode }) {
  const toneClass =
    tone === "accent" ? "bg-accent-soft text-accent" : "bg-surface-raised text-ink border border-line";
  return (
    <span className={`inline-flex items-center gap-2 rounded-pill px-3 py-0.5 text-body-sm font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}
