import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makePoll } from "@/test/fixtures";
import { saveMyVote } from "@/lib/vote-storage";
import { PollView } from "./PollView";

vi.mock("next/navigation", async () => {
  const { router } = await import("@/test/next-mocks");
  return { useRouter: () => router };
});

afterEach(() => window.localStorage.clear());

describe("PollView", () => {
  it("shows the results and a blank vote form", () => {
    render(<PollView poll={makePoll()} />);
    expect(screen.getByRole("heading", { name: "Who can make it" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Add your availability" })).toBeInTheDocument();
  });

  it("recognises this browser's stored vote", () => {
    saveMyVote("poll1", { voteId: "v2", editToken: "t" });
    render(<PollView poll={makePoll()} />);
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Edit your availability" })).toBeInTheDocument();
  });

  it("hides the vote form when the poll is closed", () => {
    render(<PollView poll={makePoll({ status: "closed", finalSlotId: "s1" })} />);
    expect(screen.queryByRole("heading", { name: /your availability/ })).toBeNull();
  });
});
