import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { theme } from "../src/theme/theme";
import "../src/index.css";

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
  },
};

export const decorators = [
  (Story: React.FC) => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          padding: "2rem",
          display: "flex",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <Story />
      </div>
    </ThemeProvider>
  ),
];