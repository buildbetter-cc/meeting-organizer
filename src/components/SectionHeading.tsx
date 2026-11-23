import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
};

/** Eyebrow, title and lead for the top of a section. */
export function SectionHeading({ eyebrow, title, lead, as: Tag = "h2" }: Props) {
  return (
    <div className="flex max-w-[720px] flex-col gap-3">
      {eyebrow && <p className="m-0 text-eyebrow uppercase text-accent">{eyebrow}</p>}
      <Tag className="m-0 font-display text-heading-1 text-ink">{title}</Tag>
      {lead && <p className="m-0 text-lead text-ink-muted">{lead}</p>}
    </div>
  );
}
