"use client";

import { useState } from "react";
import { useIsClient } from "@/lib/use-is-client";
import { Button } from "./Button";
import { Card } from "./Card";
import { inputClass } from "./Field";

function CopyRow({ id, label, url, note }: { id: string; label: string; url: string; note: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      (document.getElementById(id) as HTMLInputElement | null)?.select();
    }
  }
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">{label}</label>
      <div className="flex flex-wrap gap-3">
        <input id={id} readOnly value={url} className={`${inputClass} min-w-0 flex-1 border-line-strong`} onFocus={(e) => e.target.select()} />
        <Button variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
      </div>
      <p className="m-0 text-body-sm text-ink-muted">{note}</p>
    </div>
  );
}

/** The participant link to share and the private admin link. */
export function ShareLinks({ pollId, adminToken }: { pollId: string; adminToken: string }) {
  const isClient = useIsClient();
  const origin = isClient ? window.location.origin : "";
  return (
    <Card title="Links">
      <CopyRow id="participant-link" label="Participant link" url={`${origin}/p/${pollId}`}
        note="Send this to everyone you want to invite." />
      <CopyRow id="admin-link" label="Your admin link" url={`${origin}/p/${pollId}/admin/${adminToken}`}
        note="Keep this private and save it somewhere. Anyone with it can pick the final time, and it can't be recovered." />
    </Card>
  );
}
