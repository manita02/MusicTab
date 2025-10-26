import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import { MessageModal } from "./MessageModal";

describe("MessageModal", () => {
  it("correctly renders the message", () => {
    render(<MessageModal open message="Test message" />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("calls onConfirm when pressing Accept", () => {
    const onConfirm = vi.fn();
    render(<MessageModal open onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("Accept"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel when pressing Cancel", () => {
    const onCancel = vi.fn();
    render(
      <MessageModal
        open
        cancelText="Cancel"
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("only shows one button in error type", () => {
    render(<MessageModal open type="error" />);
    expect(screen.queryByText("Cancel")).toBeNull();
    expect(screen.getByText("Accept")).toBeInTheDocument();
  });
});