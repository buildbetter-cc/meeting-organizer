import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "./Button";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-[72px] w-full max-w-page items-center justify-between gap-8 px-6 md:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-sm text-ink no-underline">
          <Image src="/buildbetter-mark.png" alt="" width={21} height={28} priority />
          <span className="font-display text-[22px] font-bold leading-none">BetterMeet</span>
          <span className="hidden text-body-sm text-ink-muted sm:inline">by buildbetter</span>
        </Link>
        <Link href="/" className={buttonClass("secondary")}>
          New poll
        </Link>
      </div>
    </header>
  );
}
