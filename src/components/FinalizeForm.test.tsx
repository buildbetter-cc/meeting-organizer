import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makePoll } from "@/test/fixtures";
import { queueFetch, router, sentBody } from "@/test/next-mocks";
import { FinalizeForm } from "./FinalizeForm";

vi.mock("next/navigation", async () => {
  const { router } = await import("@/test/next-mocks");
  return { useRouter: () => router };
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("FinalizeForm", () => {
  it("preselects the most available slot and shows counts", () => {
    render(<FinalizeForm poll={makePoll()} adminToken="a1" />);
    const [first, second] = screen.getAllByRole("radio");
    expect(first).toBeChecked();
    expect(second).not.toBeChecked();
    expect(screen.getByText("2 available")).toBeInTheDocument();
  });

  it("sends the chosen slot with the admin token", async () => {
    const fetchMock = queueFetch({ status: 200, body: { ok: true } });
    render(<FinalizeForm poll={makePoll()} adminToken="a1" />);
    await userEvent.click(screen.getAllByRole("radio")[1]);
    await userEvent.click(screen.getByRole("button", { name: "Confirm final time" }));
    expect(fetchMock).toHaveBeenCalledWith("/api/polls/poll1/finalize", expect.anything());
    expect(sentBody(fetchMock)).toEqual({ adminToken: "a1", slotId: "s2" });
    expect(router.refresh).toHaveBeenCalled();
  });

  it("shows an error from the server", async () => {
    queueFetch({ status: 403, body: { error: "This admin link is not valid." } });
    render(<FinalizeForm poll={makePoll()} adminToken="bad" />);
    await userEvent.click(screen.getByRole("button", { name: "Confirm final time" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("This admin link is not valid.");
  });
});
