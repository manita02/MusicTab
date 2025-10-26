import { render, screen, fireEvent } from "@testing-library/react";
import { InputField } from "./InputField";
import { vi } from "vitest";

describe("InputField", () => {
  it("renders with label", () => {
    render(<InputField label="Name" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("handles change event", () => {
    const handleChange = vi.fn();
    render(<InputField label="Email" value="" onChange={handleChange} />);
    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "test@gmail.com" } });
    expect(handleChange).toHaveBeenCalled();
  });
});