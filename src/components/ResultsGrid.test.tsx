import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makePoll } from "@/test/fixtures";
import { ResultsGrid } from "./ResultsGrid";

describe("ResultsGrid", () => {
  it("shows each participant's answers", () => {
    render(<ResultsGrid poll={makePoll()} />);
    const bo = screen.getByRole("row", { name: /Bo/ });
    expect(within(bo).getAllByText("Yes")).toHaveLength(1);
    expect(within(bo).getAllByText("No")).toHaveLength(1);
  });

  it("counts yes answers and marks the most available slot", () => {
    render(<ResultsGrid poll={makePoll()} />);
    expect(screen.getByTestId("count-s1")).toHaveTextContent("2");
    expect(screen.getByTestId("count-s2")).toHaveTextContent("1");
    expect(screen.getAllByText("Most available")).toHaveLength(1);
  });

  it("labels this browser's vote", () => {
    render(<ResultsGrid poll={makePoll()} myVoteId="v2" />);
    expect(within(screen.getByRole("row", { name: /Cy/ })).getByText("You")).toBeInTheDocument();
  });

  it("marks the final time instead of the most available once closed", () => {
    render(<ResultsGrid poll={makePoll({ status: "closed", finalSlotId: "s2" })} />);
    expect(screen.getByText("Final time")).toBeInTheDocument();
    expect(screen.queryByText("Most available")).toBeNull();
  });

  it("shows an empty state with no votes", () => {
    render(<ResultsGrid poll={makePoll({ votes: [] })} />);
    expect(screen.getByText(/No votes yet/)).toBeInTheDocument();
  });
});
