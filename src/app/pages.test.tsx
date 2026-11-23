import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceError } from "@/lib/errors";
import { makePoll } from "@/test/fixtures";

const service = vi.hoisted(() => ({ getPublicPoll: vi.fn(), getAdminPoll: vi.fn() }));
vi.mock("@/lib/service", () => ({ getPollService: () => service }));
vi.mock("next/navigation", async () => {
  const { router } = await import("@/test/next-mocks");
  return {
    useRouter: () => router,
    notFound: () => {
      throw new Error("NEXT_NOT_FOUND");
    },
  };
});

import HomePage from "./page";
import NotFound from "./not-found";
import PollPage, { generateMetadata } from "./p/[id]/page";
import AdminPage from "./p/[id]/admin/[token]/page";

const params = <T,>(p: T) => Promise.resolve(p);

beforeEach(() => vi.clearAllMocks());

describe("home page", () => {
  it("shows the create poll form", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: "Find a time that works for everyone" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create poll" })).toBeInTheDocument();
  });
});

describe("poll page", () => {
  it("renders the poll", async () => {
    service.getPublicPoll.mockResolvedValue(makePoll());
    render(await PollPage({ params: params({ id: "poll1" }) }));
    expect(service.getPublicPoll).toHaveBeenCalledWith("poll1");
    expect(screen.getByRole("heading", { level: 1, name: "Sprint planning" })).toBeInTheDocument();
    expect(screen.getByText("Meeting poll")).toBeInTheDocument();
  });

  it("shows the closed state", async () => {
    service.getPublicPoll.mockResolvedValue(makePoll({ status: "closed", finalSlotId: "s1" }));
    render(await PollPage({ params: params({ id: "poll1" }) }));
    expect(screen.getByText("Closed poll")).toBeInTheDocument();
    expect(screen.getAllByText("Final time").length).toBeGreaterThan(0);
  });

  it("uses the poll title in the page title", async () => {
    service.getPublicPoll.mockResolvedValue(makePoll());
    expect((await generateMetadata({ params: params({ id: "poll1" }) })).title).toBe("Sprint planning · BetterMeet");
  });

  it("404s for an unknown poll", async () => {
    service.getPublicPoll.mockRejectedValue(new ServiceError("not_found", "x"));
    await expect(PollPage({ params: params({ id: "nope" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("admin page", () => {
  const props = (created?: string) => ({
    params: params({ id: "poll1", token: "a1" }),
    searchParams: params({ created }),
  });

  it("shows links, results and the finalize form", async () => {
    service.getAdminPoll.mockResolvedValue(makePoll());
    render(await AdminPage(props("1")));
    expect(service.getAdminPoll).toHaveBeenCalledWith("poll1", "a1");
    expect(screen.getByText(/Your poll is ready/)).toBeInTheDocument();
    expect(screen.getByLabelText("Your admin link")).toHaveValue(`${window.location.origin}/p/poll1/admin/a1`);
    expect(screen.getByRole("button", { name: "Confirm final time" })).toBeInTheDocument();
  });

  it("hides the finalize form once closed", async () => {
    service.getAdminPoll.mockResolvedValue(makePoll({ status: "closed", finalSlotId: "s1" }));
    render(await AdminPage(props()));
    expect(screen.queryByText(/Your poll is ready/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Confirm final time" })).toBeNull();
  });

  it("404s for a wrong admin token", async () => {
    service.getAdminPoll.mockRejectedValue(new ServiceError("forbidden", "x"));
    await expect(AdminPage(props())).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("not found page", () => {
  it("links back to creating a poll", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: "Create a new poll" })).toHaveAttribute("href", "/");
  });
});
