import type { ReactNode } from "react";
import { BrandBar } from "./BrandBar";

/** A raised panel: surface-raised with a 1px line border, never a shadow. */
export function Card({
  title,
  children,
  brandBar = true,
  className = "",
}: {
  title?: ReactNode;
  children: ReactNode;
  brandBar?: boolean;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-4 rounded-xl border border-line bg-surface-raised p-6 md:p-8 ${className}`}>
      {brandBar && <BrandBar />}
      {title && <h2 className="m-0 font-display text-heading-3 text-ink">{title}</h2>}
      {children}
    </section>
  );
}
