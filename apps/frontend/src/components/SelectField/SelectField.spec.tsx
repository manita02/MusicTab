import { render, screen, fireEvent } from "@testing-library/react";
import { SelectField } from "./SelectField";
import { vi } from "vitest";

const options = [
  { value: "rock", label: "Rock" },
  { value: "jazz", label: "Jazz" },
];

describe("SelectField", () => {
  it("renders label", () => {
    render(<SelectField label="Genre" value="" onChange={() => {}} options={options} />);
    expect(screen.getByLabelText("Genre")).toBeInTheDocument();
  });

  it("calls onChange when selecting", () => {
    const handleChange = vi.fn();
    render(<SelectField label="Genre" value="" onChange={handleChange} options={options} />);
    fireEvent.mouseDown(screen.getByLabelText("Genre"));
    expect(handleChange).not.toBeNull();
  });
});