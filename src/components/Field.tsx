import type { ReactNode } from "react";

export const inputClass =
  "h-11 w-full rounded-sm border bg-surface px-3 text-body text-ink placeholder:text-ink-muted/70";

export function inputBorder(error?: string): string {
  return error ? "border-danger" : "border-line-strong";
}

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
};

/** A labelled form control with an optional hint and error message. */
export function Field({ id, label, error, hint, optional, children }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">
        {label}
        {optional && <span className="ml-2 font-normal text-ink-muted">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="m-0 text-body-sm text-ink-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="m-0 text-body-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
