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

  it("renders search icon and triggers onSearch", () => {
    const handleSearch = vi.fn();
    render(
      <InputField
        label="Buscar"
        value=""
        onChange={() => {}}
        isSearch
        onSearch={handleSearch}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleSearch).toHaveBeenCalled();
  });

  it("does not render search icon if isSearch=false", () => {
    render(<InputField label="NoSearch" value="" onChange={() => {}} />);
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBe(0);
  });

  it("forwards paste and drop handlers", () => {
    const onPaste = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const onDrop = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <InputField label="Email" value="" onChange={() => {}} onPaste={onPaste} onDrop={onDrop} />,
    );
    const input = screen.getByLabelText("Email");
    fireEvent.paste(input, { clipboardData: { getData: () => "copied@gmail.com" } });
    fireEvent.drop(input);
    expect(onPaste).toHaveBeenCalled();
    expect(onDrop).toHaveBeenCalled();
  });
});