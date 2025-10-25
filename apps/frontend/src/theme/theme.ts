import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0046FF",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#73C8D2",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#FF9013",
      contrastText: "#000000",
    },
    background: {
      default: "#F5F1DC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1C1C1C",
      secondary: "#555555",
    },
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    fontSize: 14,
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "99px",
          padding: "8px 20px",
          transition: "all 0.2s ease",
          "&:hover": {
            filter: "brightness(1.1)",
          },
        },
      },
    },
  },
});