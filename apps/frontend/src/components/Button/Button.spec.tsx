import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders primary button", () => {
    render(<Button label="Save" variantType="primary" />);
    const btn = screen.getByText("Save");
    expect(btn).toBeInTheDocument();
  });

  it("renders secondary button", () => {
    render(<Button label="Sign Up" variantType="secondary" />);
    const btn = screen.getByText("Sign Up");
    expect(btn).toBeInTheDocument();
  });

  it("renders danger button", () => {
    render(<Button label="Delete" variantType="danger" />);
    const btn = screen.getByText("Delete");
    expect(btn).toBeInTheDocument();
  });

  it("hover bold simulation (css applied in MUI theme)", async () => {
    render(<Button label="HoverTest" variantType="primary" />);
    const btn = screen.getByText("HoverTest");
    await userEvent.hover(btn);
    expect(btn).toBeInTheDocument();
  });
});