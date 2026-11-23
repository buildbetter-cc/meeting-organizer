import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-label font-semibold no-underline transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-45";
const heights: Record<ButtonSize, string> = { md: "h-11", lg: "h-13 text-base" };
const paddings: Record<ButtonSize, string> = { md: "px-6", lg: "px-8" };
const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:brightness-110",
  secondary: "bg-transparent text-ink border-line-strong hover:border-ink",
  ghost: "bg-transparent text-accent px-2 hover:underline underline-offset-4",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  const padding = variant === "ghost" ? "" : paddings[size];
  return `${base} ${heights[size]} ${padding} ${variants[variant]}`.replace(/\s+/g, " ");
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: ReactNode;
};

/** buildbetter Button: primary once per view, secondary for the alternative path, ghost for inline links. */
export function Button({ variant = "primary", size = "md", href, className = "", children, ...rest }: Props) {
  const cls = `${buttonClass(variant, size)} ${className}`.trim();
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
