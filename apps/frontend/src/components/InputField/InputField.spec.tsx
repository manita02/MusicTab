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

    // Verificar que el icono esté presente
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    // Disparar click sobre el icono
    fireEvent.click(button);
    expect(handleSearch).toHaveBeenCalled();
  });

  it("does not render search icon if isSearch=false", () => {
    render(<InputField label="NoSearch" value="" onChange={() => {}} />);
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBe(0);
  });
});