import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makePoll } from "@/test/fixtures";
import { FinalTime } from "./FinalTime";
import { PollHeader } from "./PollHeader";

describe("PollHeader", () => {
  it("shows the title, description, organizer and location", () => {
    render(<PollHeader poll={makePoll()} eyebrow="Meeting poll" />);
    expect(screen.getByRole("heading", { level: 1, name: "Sprint planning" })).toBeInTheDocument();
    expect(screen.getByText("Plan the next sprint")).toBeInTheDocument();
    expect(screen.getByText("Ann")).toBeInTheDocument();
    expect(screen.getByText("Room 4")).toBeInTheDocument();
  });

  it("omits a missing location", () => {
    render(<PollHeader poll={makePoll({ location: null })} eyebrow="x" />);
    expect(screen.queryByText("Room 4")).toBeNull();
  });
});

describe("FinalTime", () => {
  it("renders nothing while the poll is open", () => {
    const { container } = render(<FinalTime poll={makePoll()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the final time once closed", () => {
    render(<FinalTime poll={makePoll({ status: "closed", finalSlotId: "s1" })} />);
    expect(screen.getByText("Final time")).toBeInTheDocument();
    expect(screen.getByText(/This poll is closed · Room 4/)).toBeInTheDocument();
  });
});
