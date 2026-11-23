/** The 96 × 6px cyan → blue → purple bar: the one place the logo gradient appears in UI. */
export function BrandBar({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-testid="brand-bar"
      className={`block h-1.5 w-24 rounded-[6px] bg-linear-to-r from-brand-cyan via-brand-blue to-brand-purple ${className}`}
    />
  );
}
