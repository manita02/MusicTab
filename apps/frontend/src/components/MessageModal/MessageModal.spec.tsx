import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import { MessageModal } from "./MessageModal";

describe("MessageModal", () => {
  it("renderiza correctamente el mensaje", () => {
    render(<MessageModal open message="Mensaje de prueba" />);
    expect(screen.getByText("Mensaje de prueba")).toBeInTheDocument();
  });

  it("llama a onConfirm al presionar Aceptar", () => {
    const onConfirm = vi.fn();
    render(<MessageModal open onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("Aceptar"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("llama a onCancel al presionar Cancelar", () => {
    const onCancel = vi.fn();
    render(
      <MessageModal
        open
        cancelText="Cancelar"
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("solo muestra un botón en tipo error", () => {
    render(<MessageModal open type="error" />);
    expect(screen.queryByText("Cancelar")).toBeNull();
    expect(screen.getByText("Aceptar")).toBeInTheDocument();
  });
});