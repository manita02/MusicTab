import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../../theme/theme";
import { IconLoader } from "./IconLoader";

describe("IconLoader", () => {
  it("renders when active is true", () => {
    render(
      <ThemeProvider theme={theme}>
        <IconLoader active={true} />
      </ThemeProvider>
    );

    const loader = screen.getByRole("progressbar");
    expect(loader).toBeInTheDocument();
  });

  it("does not render when active is false", () => {
    render(
      <ThemeProvider theme={theme}>
        <IconLoader active={false} />
      </ThemeProvider>
    );

    const loader = screen.queryByRole("progressbar");
    expect(loader).toBeNull();
  });
});