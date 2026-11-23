import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ShareLinks } from "./ShareLinks";

describe("ShareLinks", () => {
  it("shows full participant and admin links", () => {
    render(<ShareLinks pollId="p1" adminToken="a1" />);
    expect(screen.getByLabelText("Participant link")).toHaveValue(`${window.location.origin}/p/p1`);
    expect(screen.getByLabelText("Your admin link")).toHaveValue(`${window.location.origin}/p/p1/admin/a1`);
  });

  it("copies a link to the clipboard", async () => {
    const user = userEvent.setup();
    render(<ShareLinks pollId="p1" adminToken="a1" />);
    await user.click(screen.getAllByRole("button", { name: "Copy" })[0]);
    expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/p/p1`);
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
});
