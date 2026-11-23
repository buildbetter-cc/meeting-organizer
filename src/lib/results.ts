import type { Choice } from "./types";

/** Number of "yes" answers per slot id. Every slot appears, even with zero. */
export function tallyYes(
  slots: readonly { id: string }[],
  votes: readonly { choices: readonly Choice[] }[],
): Record<string, number> {
  const tally: Record<string, number> = Object.fromEntries(slots.map((s) => [s.id, 0]));
  for (const vote of votes) {
    for (const c of vote.choices) {
      if (c.answer === "yes" && c.slotId in tally) tally[c.slotId] += 1;
    }
  }
  return tally;
}

/** Ids of the slots with the most "yes" answers. Empty when nobody has said yes yet. */
export function bestSlotIds(tally: Record<string, number>): string[] {
  const max = Math.max(0, ...Object.values(tally));
  if (max === 0) return [];
  return Object.keys(tally).filter((id) => tally[id] === max);
}
