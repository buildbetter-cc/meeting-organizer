import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useIsClient } from "./use-is-client";

function Probe() {
  return <span>{useIsClient() ? "client" : "server"}</span>;
}

describe("useIsClient", () => {
  it("is false during server rendering", () => {
    expect(renderToString(<Probe />)).toContain("server");
  });

  it("is true in the browser", () => {
    render(<Probe />);
    expect(screen.getByText("client")).toBeInTheDocument();
  });
});
