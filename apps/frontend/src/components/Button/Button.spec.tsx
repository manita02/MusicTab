import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders primary button", () => {
    render(<Button label="Save" variant="primary" />);
    expect(screen.getByText("Save")).toHaveClass("btn primary");
  });

  it("renders secondary button", () => {
    render(<Button label="Sign Up" variant="secondary" />);
    expect(screen.getByText("Sign Up")).toHaveClass("btn secondary");
  });

  it("renders danger button", () => {
    render(<Button label="Delete" variant="danger" />);
    expect(screen.getByText("Delete")).toHaveClass("btn danger");
  });
});
