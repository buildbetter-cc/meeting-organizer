import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { formatSlotParts } from "@/lib/format";
import { SlotLabel } from "./SlotLabel";

const start = "2026-12-01T03:00:00.000Z";
const end = "2026-12-01T04:00:00.000Z";

describe("SlotLabel", () => {
  it("renders UTC on the server", () => {
    expect(renderToString(<SlotLabel startAt={start} endAt={end} />)).toContain("UTC");
  });

  it("renders local time in the browser", () => {
    const { date, time } = formatSlotParts(start, end);
    render(<SlotLabel startAt={start} endAt={end} />);
    expect(screen.getByText(date)).toBeInTheDocument();
    expect(screen.getByText(time)).toBeInTheDocument();
    expect(screen.queryByText(/UTC/)).toBeNull();
  });
});
