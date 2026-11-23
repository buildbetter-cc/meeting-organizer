import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { queueFetch, router, sentBody } from "@/test/next-mocks";
import { CreatePollForm } from "./CreatePollForm";

vi.mock("next/navigation", async () => {
  const { router } = await import("@/test/next-mocks");
  return { useRouter: () => router };
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText("Title"), "Retro");
  await userEvent.type(screen.getByLabelText("Your name"), "Ann");
  await userEvent.type(screen.getByLabelText("Option 1 date"), "2026-12-01");
}

describe("CreatePollForm", () => {
  it("creates a poll and goes to the admin page", async () => {
    const fetchMock = queueFetch({ status: 201, body: { pollId: "p1", adminToken: "a1" } });
    render(<CreatePollForm />);
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "Create poll" }));

    expect(sentBody(fetchMock)).toMatchObject({
      title: "Retro",
      organizerName: "Ann",
      slots: [{ startAt: new Date(2026, 11, 1, 9, 0).toISOString(), endAt: new Date(2026, 11, 1, 10, 0).toISOString() }],
    });
    expect(router.push).toHaveBeenCalledWith("/p/p1/admin/a1?created=1");
  });

  it("shows validation errors without calling the server", async () => {
    const fetchMock = queueFetch();
    render(<CreatePollForm />);
    await userEvent.click(screen.getByRole("button", { name: "Create poll" }));
    expect(screen.getByText("Title is required.")).toBeInTheDocument();
    expect(screen.getByText("Your name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a date, start time and end time.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("flags a slot that ends before it starts", async () => {
    render(<CreatePollForm />);
    await fillValidForm();
    const end = screen.getByLabelText("Option 1 end");
    await userEvent.clear(end);
    await userEvent.type(end, "08:00");
    await userEvent.click(screen.getByRole("button", { name: "Create poll" }));
    expect(screen.getByText("End time must be after start time.")).toBeInTheDocument();
  });

  it("adds a slot copying the previous one, and removes slots", async () => {
    render(<CreatePollForm />);
    await userEvent.type(screen.getByLabelText("Option 1 date"), "2026-12-01");
    await userEvent.click(screen.getByRole("button", { name: "Add another time" }));
    expect(screen.getByLabelText("Option 2 date")).toHaveValue("2026-12-01");
    await userEvent.click(screen.getByRole("button", { name: "Remove option 1" }));
    expect(screen.queryByLabelText("Option 2 date")).toBeNull();
    expect(screen.queryByRole("button", { name: /Remove option/ })).toBeNull();
  });

  it("shows a server error", async () => {
    queueFetch({ status: 500, body: { error: "Something went wrong. Please try again." } });
    render(<CreatePollForm />);
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "Create poll" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("button", { name: "Create poll" })).toBeEnabled();
  });
});
