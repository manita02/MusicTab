import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { beforeEach, describe, expect, it } from "vitest";
import { TabCaptureStudioDialog } from "./TabCaptureStudioDialog";
import { theme } from "../theme/theme";

function desktopMatchMedia(query: string): MediaQueryList {
  return {
    matches: true,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };
}

describe("TabCaptureStudioDialog", () => {
  beforeEach(() => {
    window.matchMedia = desktopMatchMedia as typeof window.matchMedia;
  });

  it("loads the YouTube iframe from a pasted URL and keeps capture disabled until sharing", () => {
    render(
      <ThemeProvider theme={theme}>
        <TabCaptureStudioDialog open onClose={() => {}} />
      </ThemeProvider>,
    );

    expect(screen.queryByTitle("YouTube tablature video")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/^Title$/i), { target: { value: "Wonderwall" } });
    fireEvent.change(screen.getByPlaceholderText(/^Video URL$/i), {
      target: { value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    });

    expect(screen.getByTitle("YouTube tablature video")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Capture frame/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Download PDF/i })).toBeDisabled();
    expect(screen.getByTestId("tab-capture-preview")).toHaveTextContent(/Captures will stack here/i);
  });

  it("does not enable share without a valid YouTube URL", () => {
    render(
      <ThemeProvider theme={theme}>
        <TabCaptureStudioDialog open onClose={() => {}} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("button", { name: /Share this tab/i })).toBeDisabled();
  });
});
