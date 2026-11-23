import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makePoll } from "@/test/fixtures";
import { queueFetch, router, sentBody } from "@/test/next-mocks";
import { loadMyVote } from "@/lib/vote-storage";
import { VoteForm } from "./VoteForm";

vi.mock("next/navigation", async () => {
  const { router } = await import("@/test/next-mocks");
  return { useRouter: () => router };
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  window.localStorage.clear();
});

describe("VoteForm", () => {
  it("submits a new vote, remembers it and refreshes", async () => {
    const fetchMock = queueFetch({ status: 201, body: { voteId: "v9", editToken: "t9" } });
    const onSaved = vi.fn();
    render(<VoteForm poll={makePoll()} myVote={null} onSaved={onSaved} />);

    await userEvent.type(screen.getByLabelText("Your name"), "Dee");
    await userEvent.click(screen.getAllByRole("checkbox")[1]);
    await userEvent.click(screen.getByRole("button", { name: "Save my availability" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/polls/poll1/votes", expect.objectContaining({ method: "POST" }));
    expect(sentBody(fetchMock)).toEqual({
      participantName: "Dee",
      choices: [{ slotId: "s1", answer: "no" }, { slotId: "s2", answer: "yes" }],
    });
    expect(loadMyVote("poll1")).toEqual({ voteId: "v9", editToken: "t9" });
    expect(onSaved).toHaveBeenCalledWith({ voteId: "v9", editToken: "t9" });
    expect(router.refresh).toHaveBeenCalled();
    expect(await screen.findByRole("status")).toHaveTextContent("Saved");
  });

  it("requires a name before sending", async () => {
    const fetchMock = queueFetch();
    render(<VoteForm poll={makePoll()} myVote={null} onSaved={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Save my availability" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Your name is required.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("prefills and updates this browser's earlier vote", async () => {
    const fetchMock = queueFetch({ status: 200, body: { ok: true } });
    render(<VoteForm poll={makePoll()} myVote={{ voteId: "v1", editToken: "t1" }} onSaved={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Edit your availability" })).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toHaveValue("Bo");
    const [first, second] = screen.getAllByRole("checkbox");
    expect(first).toBeChecked();
    expect(second).not.toBeChecked();

    await userEvent.click(first);
    await userEvent.click(screen.getByRole("button", { name: "Update my availability" }));
    expect(fetchMock).toHaveBeenCalledWith("/api/votes/v1", expect.objectContaining({ method: "PUT" }));
    expect(sentBody(fetchMock)).toMatchObject({ editToken: "t1", choices: [{ slotId: "s1", answer: "no" }, { slotId: "s2", answer: "no" }] });
  });

  it("shows a server error such as a closed poll", async () => {
    queueFetch({ status: 409, body: { error: "This poll is closed.", fields: {} } });
    render(<VoteForm poll={makePoll()} myVote={null} onSaved={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Your name"), "Dee");
    await userEvent.click(screen.getByRole("button", { name: "Save my availability" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("This poll is closed.");
  });

  it("shows field errors from the server", async () => {
    queueFetch({ status: 400, body: { error: "Check", fields: { choices: "Answer every time slot." } } });
    render(<VoteForm poll={makePoll()} myVote={null} onSaved={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("Your name"), "Dee");
    await userEvent.click(screen.getByRole("button", { name: "Save my availability" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Answer every time slot.");
  });
});
