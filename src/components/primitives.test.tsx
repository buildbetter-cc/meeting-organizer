import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandBar } from "./BrandBar";
import { Button, buttonClass } from "./Button";
import { Card } from "./Card";
import { Field } from "./Field";
import { Pill } from "./Pill";
import { SectionHeading } from "./SectionHeading";
import { SiteHeader } from "./SiteHeader";

describe("Button", () => {
  it("renders a non-submitting button by default", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("renders a link when given href", () => {
    render(<Button href="/x" variant="secondary">Go</Button>);
    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("href", "/x");
  });

  it("builds classes per variant and size", () => {
    expect(buttonClass("primary", "md")).toContain("bg-primary");
    expect(buttonClass("primary", "lg")).toContain("h-13");
    expect(buttonClass("secondary")).toContain("border-line-strong");
    expect(buttonClass("ghost")).not.toContain("px-6");
  });
});

describe("BrandBar", () => {
  it("is decorative", () => {
    render(<BrandBar />);
    expect(screen.getByTestId("brand-bar")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Pill", () => {
  it("renders neutral and accent tones", () => {
    render(<><Pill>One</Pill><Pill tone="accent">Two</Pill></>);
    expect(screen.getByText("One").className).toContain("bg-surface-raised");
    expect(screen.getByText("Two").className).toContain("bg-accent-soft");
  });
});

describe("SectionHeading", () => {
  it("renders the eyebrow, title at the chosen level and lead", () => {
    render(<SectionHeading as="h1" eyebrow="New poll" title="Find a time" lead="Lead text" />);
    expect(screen.getByRole("heading", { level: 1, name: "Find a time" })).toBeInTheDocument();
    expect(screen.getByText("New poll")).toBeInTheDocument();
    expect(screen.getByText("Lead text")).toBeInTheDocument();
  });

  it("defaults to h2 and omits empty parts", () => {
    const { container } = render(<SectionHeading title="T" />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});

describe("Card", () => {
  it("shows a brand bar and title by default", () => {
    render(<Card title="Details">Body</Card>);
    expect(screen.getByRole("heading", { name: "Details" })).toBeInTheDocument();
    expect(screen.getByTestId("brand-bar")).toBeInTheDocument();
  });

  it("can hide the brand bar", () => {
    render(<Card brandBar={false}>Body</Card>);
    expect(screen.queryByTestId("brand-bar")).toBeNull();
  });
});

describe("Field", () => {
  it("labels its control and shows a hint", () => {
    render(<Field id="f" label="Location" optional hint="A room"><input id="f" /></Field>);
    expect(screen.getByLabelText(/Location/)).toBeInTheDocument();
    expect(screen.getByText("(optional)")).toBeInTheDocument();
    expect(screen.getByText("A room")).toBeInTheDocument();
  });

  it("shows the error instead of the hint", () => {
    render(<Field id="f" label="Title" hint="Hint" error="Required"><input id="f" /></Field>);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.queryByText("Hint")).toBeNull();
  });
});

describe("SiteHeader", () => {
  it("shows the product name and a new poll link", () => {
    render(<SiteHeader />);
    expect(screen.getByText("BetterMeet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New poll" })).toHaveAttribute("href", "/");
  });
});
