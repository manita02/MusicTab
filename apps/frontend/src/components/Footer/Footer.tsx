import React from "react";
import { Box, Typography, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import forItLogo from "../../assets/forit_logo.png";
import formarLogo from "../../assets/formar_logo.png";

export const Footer: React.FC = () => {
  const theme = useTheme();

  const logoLinkSx = {
    display: "inline-flex",
    alignItems: "center",
    transition: "transform 0.3s ease, opacity 0.3s ease",
    "&:hover": {
      transform: "scale(1.08)",
      opacity: 0.85,
    },
  };

  return (
    <Box
      component="footer"
      sx={{
        py: { xs: 0.75, md: 0.85 },
        px: { xs: 1.5, md: 2 },
        mt: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        borderTop: `1px solid ${
          theme.palette.mode === "light" ? "#e0e0e0" : "#444"
        }`,
        minHeight: { xs: 52, md: 48 },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          px: { md: 2, lg: 3 },
          gap: 1.5,
        }}
      >
        <Link
          href="https://forit.ar"
          target="_blank"
          rel="noopener noreferrer"
          sx={logoLinkSx}
        >
          <Box component="img" src={forItLogo} alt="Logo For IT" sx={{ height: 28 }} />
        </Link>

        <Box sx={{ textAlign: "center", flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="caption" component="p" sx={{ lineHeight: 1.3, m: 0 }}>
            © {new Date().getFullYear()} <strong>MusicTab</strong>. All rights reserved.
            {" "}
            Developed by{" "}
            <Link
              href="https://github.com/manita02"
              underline="none"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                letterSpacing: "0.01em",
                borderBottom: `1px solid ${theme.palette.text.secondary}55`,
                transition: "color 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  color: theme.palette.secondary.main,
                  borderBottomColor: theme.palette.secondary.main,
                },
              }}
            >
              Ana Lucia Juarez
            </Link>
          </Typography>
        </Box>

        <Link
          href="https://fundacionformar.ar"
          target="_blank"
          rel="noopener noreferrer"
          sx={logoLinkSx}
        >
          <Box
            component="img"
            src={formarLogo}
            alt="Logo Fundación Formar"
            sx={{ height: 26 }}
          />
        </Link>
      </Box>

      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          gap: 1,
        }}
      >
        <Link href="https://forit.ar" target="_blank" rel="noopener noreferrer" sx={logoLinkSx}>
          <Box
            component="img"
            src={forItLogo}
            alt="Logo For IT"
            sx={{ height: 22, width: "auto" }}
          />
        </Link>

        <Typography variant="caption" sx={{ lineHeight: 1.25, px: 0.5 }}>
          © {new Date().getFullYear()} <strong>MusicTab</strong>
        </Typography>

        <Link
          href="https://fundacionformar.ar"
          target="_blank"
          rel="noopener noreferrer"
          sx={logoLinkSx}
        >
          <Box
            component="img"
            src={formarLogo}
            alt="Logo Fundación Formar"
            sx={{ height: 22, width: "auto" }}
          />
        </Link>
      </Box>
    </Box>
  );
};
